// scripts/fix-all-frontmatter.js
const fs = require("fs");
const path = require("path");

const notesDir = path.join(__dirname, "../src/notes");

function slugify(input) {
  return input.normalize("NFC").replace(/\s+/g, "-").toLowerCase();
}

function getFileCreationTime(filePath) {
  try {
    return fs.statSync(filePath).birthtime.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function fixFile(filePath) {
  if (!filePath.endsWith(".md")) return;
  const raw = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".md");
  const cleanFileName = fileName.normalize("NFC");
  const permalink = `/notes/${slugify(cleanFileName)}/index.html`;

  // 去掉原始 front matter（防止残留错误）
  let body = raw;
  if (raw.startsWith("---")) {
    const second = raw.indexOf("---", 3);
    if (second !== -1) {
      body = raw.slice(second + 3).trimStart();
    }
  }

  // 重建 front matter
  const fm = `---\ntitle: "${cleanFileName}"\nlayout: "note.njk"\ndate: "${getFileCreationTime(
    filePath
  )}"\npermalink: "${permalink}"\ntags: []\n---\n\n`;

  fs.writeFileSync(filePath, fm + body, "utf8");
  console.log("已重建 front matter:", fileName);
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else fixFile(full);
  }
}

console.log("开始重建所有 front matter...");
walk(notesDir);
console.log("全部修复完成！");
