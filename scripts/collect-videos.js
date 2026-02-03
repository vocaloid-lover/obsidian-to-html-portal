// scripts/collect-videos.js
// Scan src/notes for ![[video: path/to/file.mp4 | optional caption]] directives
// Generate src/_data/video_index.json mapping note slug -> array of { filename, poster, caption }

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const notesDir = path.join(__dirname, '../src/notes');
const outData = path.join(__dirname, '../src/_data/video_index.json');

// Regex supports optional caption after '|'
const videoRegex = /!\[\[video:\s*([^\|\]]+?)(?:\s*\|\s*([^\]]+))?\]\]/g;

function slugFromFile(filePath) {
  const rel = path.relative(notesDir, filePath);
  const base = rel.replace(/\.md$/i, '');
  const parts = base.split(path.sep);
  return parts[parts.length - 1].replace(/\s+/g, '-').toLowerCase();
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ffmpegAvailable() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function generatePoster(localVideoPath, outPosterAbs) {
  if (!ffmpegAvailable()) return false;
  ensureDirSync(path.dirname(outPosterAbs));
  const cmd = `ffmpeg -y -ss 00:00:01 -i "${localVideoPath}" -vframes 1 -q:v 2 "${outPosterAbs}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function copyVideo(localVideoPath, outVideoAbs) {
  try {
    ensureDirSync(path.dirname(outVideoAbs));
    fs.copyFileSync(localVideoPath, outVideoAbs);
    return true;
  } catch (e) {
    return false;
  }
}

const index = {};

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // attempt to read slug from frontmatter if present
  let slug = slugFromFile(filePath);
  const fmMatch = raw.match(/^---[\r\n]([\s\S]*?)[\r\n]---[\r\n]?/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const slugMatch = fm.match(/(?:^|\n)slug:\s*(.+)\s*(?:\n|$)/);
    const permalinkMatch = fm.match(/(?:^|\n)permalink:\s*(.+)\s*(?:\n|$)/);
    if (slugMatch) {
      slug = slugMatch[1].trim().replace(/\/.+$/, '').replace(/\s+/g, '-').toLowerCase();
    } else if (permalinkMatch) {
      const p = permalinkMatch[1].trim();
      slug = p.replace(/\/$/, '').split('/').slice(-1)[0].replace(/\s+/g, '-').toLowerCase();
    }
  }

  let m;
  while ((m = videoRegex.exec(raw)) !== null) {
    const rawFilename = m[1].trim();
    const caption = m[2] ? m[2].trim() : null;

    // Use a public URL under /videos/<slug>/filename
    const baseName = path.basename(rawFilename);
    const publicVideoPath = `/videos/${slug}/${baseName}`;
    const publicPosterPath = `/image/videos/${slug}/${path.basename(baseName, path.extname(baseName))}-thumb.jpg`;

    // If local file exists relative to note file, copy it to public/videos/<slug>/
    const localVideoPossible = path.resolve(path.dirname(filePath), rawFilename);
    const repoVideoPossible = path.resolve(path.join(__dirname, '..', rawFilename));

    let copied = false;
    if (fs.existsSync(localVideoPossible)) {
      const outVideoAbs = path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, ''));
      copied = copyVideo(localVideoPossible, outVideoAbs);
    } else if (fs.existsSync(repoVideoPossible)) {
      const outVideoAbs = path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, ''));
      copied = copyVideo(repoVideoPossible, outVideoAbs);
    }

    // Try to generate poster if local video exists and poster missing
    if (copied) {
      const outPosterAbs = path.join(__dirname, '..', 'public', publicPosterPath.replace(/^\//, ''));
      if (!fs.existsSync(outPosterAbs)) {
        generatePoster(path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, '')), outPosterAbs);
      }
    }

    if (!index[slug]) index[slug] = [];
    index[slug].push({ filename: publicVideoPath, poster: publicPosterPath, caption });
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir, { encoding: 'utf8' });
  for (const it of items) {
    const p = path.join(dir, it);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (it.toLowerCase().endsWith('.md')) processFile(p);
  }
}

walk(notesDir);
ensureDirSync(path.dirname(outData));
fs.writeFileSync(outData, JSON.stringify(index, null, 2), 'utf8');
console.log('Wrote video index to', outData);