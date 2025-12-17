// scripts/validate-and-report.js
const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../src/notes');

class NotesValidator {
    constructor() {
        this.report = {
            total: 0,
            withFrontmatter: 0,
            missingFields: 0,
            invalidLinks: 0,
            mathIssues: 0,
            files: []
        };
    }

    validateFile(filePath, content) {
        const fileName = path.relative(notesDir, filePath);
        const fileReport = {
            name: fileName,
            issues: []
        };

        // 检查 front matter
        if (!content.startsWith('---')) {
            fileReport.issues.push('缺少 front matter');
        } else {
            const fmEnd = content.indexOf('---', 3);
            if (fmEnd === -1) {
                fileReport.issues.push('front matter 未正确关闭');
            } else {
                const fm = content.substring(0, fmEnd);
                const requiredFields = ['title', 'layout', 'date', 'permalink', 'tags'];
                requiredFields.forEach(field => {
                    if (!new RegExp(`${field}:`).test(fm)) {
                        fileReport.issues.push(`缺少字段: ${field}`);
                        this.report.missingFields++;
                    }
                });
                if (fileReport.issues.length === 0) {
                    this.report.withFrontmatter++;
                }
            }
        }

        // 检查内部链接
        const brokenLinks = (content.match(/\[([^\]]+)\]\(broken:[^\)]+\)/g) || []).length;
        if (brokenLinks > 0) {
            fileReport.issues.push(`发现 ${brokenLinks} 个断链`);
            this.report.invalidLinks += brokenLinks;
        }

        // 检查公式问题
        const mathIssues = [];
        
        // 未匹配的 $
        const dollarCount = (content.match(/(?<!\\)\$/g) || []).length;
        if (dollarCount % 2 !== 0) {
            mathIssues.push('$符号未配对');
        }

        // 空格问题
        if (/\$ +/.test(content) || / +\$/.test(content)) {
            mathIssues.push('公式前后有多余空格');
        }

        if (mathIssues.length > 0) {
            fileReport.issues.push(...mathIssues.map(i => `公式问题: ${i}`));
            this.report.mathIssues += mathIssues.length;
        }

        this.report.total++;
        if (fileReport.issues.length > 0) {
            this.report.files.push(fileReport);
        }

        return fileReport;
    }

    processDirectory(dir) {
        const items = fs.readdirSync(dir, { encoding: 'utf8' });

        items.forEach(item => {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                this.processDirectory(itemPath);
            } else if (item.endsWith('.md')) {
                const content = fs.readFileSync(itemPath, 'utf8');
                this.validateFile(itemPath, content);
            }
        });
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('笔记验证报告');
        console.log('='.repeat(60) + '\n');

        console.log(`📊 总统计`);
        console.log(`  总文件数: ${this.report.total}`);
        console.log(`  完整front matter: ${this.report.withFrontmatter}`);
        console.log(`  缺失字段: ${this.report.missingFields}`);
        console.log(`  断链数: ${this.report.invalidLinks}`);
        console.log(`  公式问题: ${this.report.mathIssues}\n`);

        if (this.report.files.length > 0) {
            console.log(`⚠️  有问题的文件 (${this.report.files.length})\n`);
            this.report.files.forEach(file => {
                console.log(`  📄 ${file.name}`);
                file.issues.forEach(issue => {
                    console.log(`     - ${issue}`);
                });
                console.log('');
            });
        } else {
            console.log(`✅ 所有文件都符合要求！\n`);
        }

        console.log('='.repeat(60) + '\n');

        // 保存报告为JSON
        const reportPath = path.join(__dirname, '../validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2), 'utf8');
        console.log(`📁 详细报告已保存到: ${reportPath}`);
    }
}

console.log('开始验证所有笔记文件...\n');
const validator = new NotesValidator();
validator.processDirectory(notesDir);
validator.generateReport();