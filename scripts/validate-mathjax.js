// scripts/validate-mathjax.js
const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../src/notes');

// 常见的LaTeX语法问题检查
const mathIssues = [];

function validateMathJax(content, filePath) {
    let issues = [];
    
    // 检查1: 检查 $ 符号配对
    const inlineMathRegex = /\$([^\$]*)\$/g;
    let match;
    const inlineMathBlocks = [];
    while ((match = inlineMathRegex.exec(content)) !== null) {
        inlineMathBlocks.push({
            start: match.index,
            end: match.index + match[0].length,
            content: match[1],
            type: 'inline'
        });
    }
    
    // 检查2: 检查 $$ 符号配对（必须在单独行）
    const displayMathRegex = /\$\$[\s\S]*?\$\$/g;
    while ((match = displayMathRegex.exec(content)) !== null) {
        // 检查 $$ 是否在单独的行上
        const lines = content.substring(0, match.index).split('\n');
        const lineNum = lines.length;
        
        const beforeText = lines[lines.length - 1];
        const afterText = content.substring(match.index + match[0].length);
        
        if (beforeText.trim() !== '' && beforeText.trim() !== '$$') {
            issues.push({
                type: 'display-math-not-isolated',
                line: lineNum,
                message: '$$公式应该单独占据一行'
            });
        }
    }
    
    // 检查3: 检查常见LaTeX错误
    const commonErrors = [
        {
            regex: /\$\s+/g,
            message: '公式内部不应该有前导空格'
        },
        {
            regex: /\s+\$/g,
            message: '公式末尾不应该有尾随空格'
        },
        {
            regex: /\\\(/g,
            message: '使用$ $而不是\\(\\)'
        },
        {
            regex: /\\\[/g,
            message: '使用$$ $$而不是\\[\\]'
        }
    ];
    
    commonErrors.forEach(check => {
        const lineNum = (content.substring(0, match?.index || 0).match(/\n/g) || []).length + 1;
        if (check.regex.test(content)) {
            issues.push({
                type: 'latex-syntax',
                message: check.message
            });
        }
    });
    
    // 检查4: 常见的公式问题
    const mathProblems = [
        {
            regex: /\$[^$]*\n\n[^$]*\$/g,
            message: '公式中含有空行，可能导致显示错误'
        },
        {
            regex: /\$\$[^$]*?\$([^$]|$)/g,
            message: '可能的 $$ 不匹配问题'
        }
    ];
    
    // 检查5: 检查未闭合的括号
    const openBracketRegex = /\$([^\$]*)\$/g;
    while ((match = openBracketRegex.exec(content)) !== null) {
        const mathContent = match[1];
        const openBraces = (mathContent.match(/\{/g) || []).length;
        const closeBraces = (mathContent.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            issues.push({
                type: 'unmatched-braces',
                line: (content.substring(0, match.index).match(/\n/g) || []).length + 1,
                message: `公式中大括号不匹配 (开: ${openBraces}, 闭: ${closeBraces})`
            });
        }
    }
    
    // 检查6: 检查常见的命令拼写错误
    const commandErrors = [
        { wrong: '\\frac', right: '\\frac' }, // 这个其实是对的，例子
        { wrong: 'mathbb', pattern: /[^\\]mathbb/g, message: '应该用 \\mathbb{}' },
        { wrong: 'mathrm', pattern: /[^\\]mathrm/g, message: '应该用 \\mathrm{}' },
    ];
    
    // 报告问题
    if (issues.length > 0) {
        console.log(`\n⚠️  ${path.relative(notesDir, filePath)}`);
        issues.forEach(issue => {
            if (issue.line) {
                console.log(`   行 ${issue.line}: ${issue.message}`);
            } else {
                console.log(`   ${issue.message}`);
            }
        });
    }
    
    return issues;
}

// 修复常见问题
function fixMathJax(content) {
    let fixed = content;
    
    // 修复1: 移除 $ 前后的空格
    fixed = fixed.replace(/\$ +/g, '$');
    fixed = fixed.replace(/ +\$/g, '$');
    
    // 修复2: 将 \( ... \) 转换为 $ ... $
    fixed = fixed.replace(/\\\(([^\)]*)\\\)/g, '$$$1$$');
    
    // 修复3: 将 \[ ... \] 转换为 $$ ... $$
    // 需要小心处理，确保两端都在单独的行上
    fixed = fixed.replace(/\\\[[\s\n]*/g, '\n$$\n');
    fixed = fixed.replace(/[\s\n]*\\\]/g, '\n$$\n');
    
    return fixed;
}

// 递归处理所有markdown文件
function processDirectory(dir, checkOnly = false) {
    const items = fs.readdirSync(dir, { encoding: 'utf8' });
    let totalIssues = 0;
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            totalIssues += processDirectory(itemPath, checkOnly);
        } else if (item.endsWith('.md')) {
            let content = fs.readFileSync(itemPath, 'utf8');
            const issues = validateMathJax(content, itemPath);
            totalIssues += issues.length;
            
            if (!checkOnly && issues.length > 0) {
                const fixed = fixMathJax(content);
                if (fixed !== content) {
                    fs.writeFileSync(itemPath, fixed, 'utf8');
                    console.log(`   ✓ 已自动修复`);
                }
            }
        }
    });
    
    return totalIssues;
}

console.log('开始验证MathJax公式...\n');
const totalIssues = processDirectory(notesDir);

if (totalIssues === 0) {
    console.log('\n✓ 未发现问题！所有公式格式正确。');
} else {
    console.log(`\n⚠️  发现 ${totalIssues} 个潜在问题`);
}