const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const notesDir = path.join(__dirname, '../src/notes');
const outDir = path.join(__dirname, '../src/search');

function readAllNotes(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { encoding: 'utf8' });
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      files = files.concat(readAllNotes(itemPath));
    } else if (item.endsWith('.md')) {
      files.push(itemPath);
    }
  });
  return files;
}

function snippet(text, max=200) {
  // 移除代码块、链接、markdown 标记
  const cleaned = text.replace(/```[\s\S]*?```/g, ' ').replace(/\[.*?\]\(.*?\)/g, ' ');
  const plain = cleaned.replace(/[#>*`$\\]/g, ' ');
  const s = plain.replace(/\s+/g, ' ').trim();
  // 若截断，留出 '...'
  if (s.length > max) {
    return s.slice(0, max).trim() + '...';
  }
  return s;
}

function buildIndex() {
  const all = [];
  const files = readAllNotes(notesDir);
  files.forEach(file => {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    const title = data.title || path.basename(file, '.md');
    const tags = data.tags || [];
    const date = data.date || fs.statSync(file).birthtime.toISOString().split('T')[0];
    // derive permalink if present in frontmatter
    const permalink = data.permalink || (`/notes/${encodeURIComponent(path.basename(file, '.md'))}/`);
    const content = parsed.content || '';
    all.push({
      id: all.length + 1,
      title,
      tags,
      date,
      permalink,
      content_snippet: snippet(content, 150),  // 搜索结果展示用，150 字
      content: snippet(content, 5000)           // 完整内容用于 Lunr 索引，5000 字
    });
  });

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
  console.log(`生成搜索索引: ${outPath} (${all.length} 条目)`);
}

buildIndex();
