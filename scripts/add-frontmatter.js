// scripts/add-frontmatter.js
const fs = require("fs");
const path = require("path");

const notesDir = path.join(__dirname, "../src/notes");

function slugify(input) {
  return input
    .normalize("NFC")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function getFileCreationTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.birthtime.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function addFrontMatter(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".md");
  const cleanFileName = fileName.normalize("NFC");
  const permalink = `/notes/${slugify(cleanFileName)}/index.html`;

  // 检查是否已有 front matter
  if (content.startsWith("---")) {
    // 查找 front matter 结束符
    const fmClose = content.indexOf("---", 3);

    if (fmClose === -1) {
      console.log(`[警告] Front matter未关闭: ${fileName}`);
      return;
    }

    // 拆分 front matter 与正文
    let fmBlock = content.substring(3, fmClose).trim();
    let rest = content.substring(fmClose + 3).trimStart();
    let fmObj = {};

    // 解析现有 front matter
    fmBlock.split("\n").forEach((line) => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        let value = match[2].trim();
        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        fmObj[match[1]] = value;
      }
    });

    // 确保必要字段存在
    if (!fmObj.title) fmObj.title = cleanFileName;
    if (!fmObj.layout) fmObj.layout = "note.njk";
    if (!fmObj.date) fmObj.date = getFileCreationTime(filePath);
    if (!fmObj.permalink) fmObj.permalink = permalink;
    if (!fmObj.tags) fmObj.tags = "[]";

    // 重建 front matter，确保中文标题正确编码
    const newFm = `---
title: "${fmObj.title}"
layout: "${fmObj.layout}"
date: "${fmObj.date}"
permalink: "${fmObj.permalink}"
tags: ${fmObj.tags}
---

`;

    fs.writeFileSync(filePath, newFm + rest, "utf8");
    return;
  }

  // 没有 front matter，新建
  const fm = `---
title: "${cleanFileName}"
layout: "note.njk"
date: "${getFileCreationTime(filePath)}"
permalink: "${permalink}"
tags: []
---

`;

  fs.writeFileSync(filePath, fm + content, "utf8");
  console.log(`添加front matter: ${fileName}`);
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir, { encoding: "utf8" });
  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (item.endsWith(".md")) {
      addFrontMatter(itemPath);
    }
  });
}

console.log("开始统一front matter...");
processDirectory(notesDir);
console.log("Front matter统一完成！");
