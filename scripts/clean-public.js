const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

console.log(`Cleaned output directory: ${publicDir}`);
