const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const notesDir = path.join(__dirname, "../src/notes");
const outDir = path.join(__dirname, "../src/search");

const entityMap = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeEntities(text = "") {
  return String(text).replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => entityMap[entity] || entity);
}

function readAllNotes(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { encoding: "utf8" });

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      files = files.concat(readAllNotes(itemPath));
    } else if (item.endsWith(".md")) {
      files.push(itemPath);
    }
  });

  return files;
}

function cleanText(text = "") {
  return decodeEntities(String(text))
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, " $1 ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\((.*?)\)/g, " $1 ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[“”"'`]+/, "");
}

function snippet(text, max = 200) {
  const plain = cleanText(text);

  if (plain.length > max) {
    return `${plain.slice(0, max).trim()}…`;
  }

  return plain;
}

function buildIndex() {
  const all = [];
  const files = readAllNotes(notesDir);

  files.forEach((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const data = parsed.data || {};
    const title = data.title || path.basename(file, ".md");
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const date = data.date || fs.statSync(file).birthtime.toISOString().split("T")[0];
    const permalink = (data.permalink || `/notes/${encodeURIComponent(path.basename(file, ".md"))}/`).replace(/index\.html$/, "");
    const content = parsed.content || "";

    all.push({
      id: all.length + 1,
      title,
      tags,
      date,
      permalink,
      content_snippet: snippet(content, 160),
      content: snippet(content, 5000),
    });
  });

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "index.json");
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), "utf8");
  console.log(`Generated search index: ${outPath} (${all.length} items)`);
}

buildIndex();
