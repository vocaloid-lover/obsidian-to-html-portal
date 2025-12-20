const fs = require('fs');
const path = require('path');
// no external deps - implement simple recursive glob

function walkDir(dir, ext, files){
  files = files || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const ent of entries){
    const full = path.join(dir, ent.name);
    if(ent.isDirectory()) walkDir(full, ext, files);
    else if(ent.isFile() && full.endsWith(ext)) files.push(full);
  }
  return files;
}

// 配置
const SRC_DIR = path.join(__dirname, '..', 'src');
const BACKUP_DIR = path.join(__dirname, '..', 'tmp', 'math-backups');

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function backupFile(file){
  const rel = path.relative(SRC_DIR, file);
  const dest = path.join(BACKUP_DIR, rel);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(file, dest);
}

function fixContent(text){
  let out = text;

  // 1) 将 \( ... \) 替换为 $...$ （行内公式）
  out = out.replace(/\\\(([\s\S]*?)\\\)/g, function(m, g1){
    return '$' + g1.trim() + '$';
  });

  // 2) 去除 $...$ 或 $$...$$ 内部前后空格
  out = out.replace(/\$(\$?)([\s\S]*?)\1\$/g, function(m, g1, g2){
    // g1 is either '' or '$' (for $$), g2 is content
    const inner = g2.replace(/^\s+|\s+$/g, '');
    return '$' + g1 + inner + g1 + '$';
  });

  // 3) 将单行内的 $$...$$ 强制为独立显示块
  out = out.replace(/(^|[^\$])\$\$([^\n\$][\s\S]*?[^\n\$])\$\$([^\$]|$)/g, function(m, p1, p2, p3){
    return p1 + '\n$$\n' + p2.trim() + '\n$$\n' + p3;
  });

  return out;
}

function processFile(file){
  const content = fs.readFileSync(file, 'utf8');
  const fixed = fixContent(content);
  if (fixed !== content){
    backupFile(file);
    fs.writeFileSync(file, fixed, 'utf8');
    console.log('Fixed:', file);
  }
}

function run(){
  ensureDir(BACKUP_DIR);
  const files = walkDir(SRC_DIR, '.md');
  files.forEach(f => {
    processFile(f);
  });
  console.log('MathJax auto-fix completed. Backups:', BACKUP_DIR);
}

if (require.main === module) run();

module.exports = { run };
