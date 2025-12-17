// scripts/convert-links.js
const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../src/notes');

// 递归获取所有笔记文件名的映射
function getNoteMap(dir = notesDir, notes = {}) {
    const items = fs.readdirSync(dir, { encoding: 'utf8' });
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            getNoteMap(itemPath, notes);
        } else if (item.endsWith('.md')) {
            const baseName = path.basename(item, '.md').normalize('NFC');
            // 创建多个映射以支持不同的查询方式
            notes[baseName.toLowerCase()] = baseName;
            notes[baseName] = baseName;
            // 添加slugified版本
            const slugified = baseName
                .normalize('NFC')
                .replace(/\s+/g, '-')
                .toLowerCase();
            notes[slugified] = baseName;
        }
    });
    
    return notes;
}

function convertObsidianLinks(content, noteMap = {}) {
    let linkStats = { converted: 0, broken: 0 };
    
    content = content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
        // 处理链接格式: [[文件名]] 或 [[文件名|显示文本]]
        const parts = linkText.split('|');
        let displayText = parts[0].trim();
        let targetFile = parts[parts.length - 1].trim();
        
        // 处理块引用 (#)
        const blockRefMatch = targetFile.match(/^([^#]+)#(.*)$/);
        let blockRef = '';
        if (blockRefMatch) {
            targetFile = blockRefMatch[1].trim();
            blockRef = blockRefMatch[2].trim();
        }
        
        // 规范化文件名
        const cleanTarget = targetFile
            .normalize('NFC')
            .replace(/\.md$/, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
        
        // 检查文件是否存在
        const targetExists = Object.keys(noteMap).some(key => 
            key.toLowerCase() === cleanTarget || 
            key.replace(/\s+/g, '-').toLowerCase() === cleanTarget
        );
        
        if (targetExists) {
            // 构建Markdown链接
            const link = `/notes/${cleanTarget}/`;
            linkStats.converted++;
            
            // 如果有块引用，添加到显示文本
            if (blockRef && !displayText.includes(`(${blockRef})`)) {
                displayText += ` (${blockRef})`;
            }
            
            return `[${displayText}](${link})`;
        } else {
            // 保留断链标识
            linkStats.broken++;
            console.warn(`[断链] "${displayText}" -> "${targetFile}"`);
            return `[${displayText}](broken:${cleanTarget})`;
        }
    });
    
    return { content, linkStats };
}

// 递归处理所有markdown文件
function processDirectory(dir, noteMap, globalStats = { converted: 0, broken: 0, processed: 0 }) {
    const items = fs.readdirSync(dir, { encoding: 'utf8' });
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            processDirectory(itemPath, noteMap, globalStats);
        } else if (item.endsWith('.md')) {
            let content = fs.readFileSync(itemPath, 'utf8');
            const { content: newContent, linkStats } = convertObsidianLinks(content, noteMap);
            
            if (newContent !== content) {
                fs.writeFileSync(itemPath, newContent, 'utf8');
            }
            
            globalStats.converted += linkStats.converted;
            globalStats.broken += linkStats.broken;
            globalStats.processed++;
            
            if (linkStats.converted > 0 || linkStats.broken > 0) {
                console.log(`✓ ${item}: ${linkStats.converted} 已转换, ${linkStats.broken} 断链`);
            }
        }
    });
    
    return globalStats;
}

console.log('开始转换Obsidian链接...');
const noteMap = getNoteMap();
console.log(`找到 ${Object.keys(noteMap).length} 个笔记`);

const stats = processDirectory(notesDir, noteMap);
console.log(`\n转换完成！`);
console.log(`处理文件: ${stats.processed}`);
console.log(`已转换链接: ${stats.converted}`);
console.log(`断链: ${stats.broken}`);
