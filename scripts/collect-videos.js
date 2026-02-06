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

let index = {};
let existingRaw = null;
let parseFailed = false;
const existingExisted = fs.existsSync(outData);
if (existingExisted) {
  try {
    existingRaw = fs.readFileSync(outData, 'utf8');
    const existing = JSON.parse(existingRaw);
    if (existing && typeof existing === 'object') index = existing;
  } catch (e) {
    console.error('Warning: failed to parse existing video_index.json — will preserve it if possible');
    parseFailed = true;
    index = {};
  }
}

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
      slug = slugMatch[1].trim().replace(/^['\"]|['\"]$/g, '').replace(/\/.+$/, '').replace(/\s+/g, '-').toLowerCase();
    } else if (permalinkMatch) {
      let p = permalinkMatch[1].trim();
      p = p.replace(/^['\"]|['\"]$/g, '');
      slug = p.replace(/\/$/, '').split('/').slice(-1)[0].replace(/\s+/g, '-').toLowerCase();
    }
  }

  // collect entries for this file; we accumulate into a per-run map and merge later
  const entriesForFile = [];

  let m;
  const foundDirectives = [];

  // Also detect converted/broken-image form produced by convert-links: ![video: path](broken:Caption)
  const brokenImgRegex = /!\[video:\s*([^\]]+)\]\(broken:([^\)]+)\)/g;
  let b;
  while ((b = brokenImgRegex.exec(raw)) !== null) {
    const rawFilename = b[1].trim();
    const caption = b[2] ? b[2].trim() : null;
    // Normalize: rawFilename might be like 'video: videos/...'
    const filename = rawFilename.replace(/^video:\s*/i, '').trim();

    // Treat this similarly to normal directives
    const baseName = path.basename(filename);
    const publicVideoPath = `/videos/${slug}/${baseName}`;
    const publicPosterPath = `/image/videos/${slug}/${path.basename(baseName, path.extname(baseName))}-thumb.jpg`;

    // If local file exists relative to note file, copy it to public/videos/<slug>/
    const localVideoPossible = path.resolve(path.dirname(filePath), filename);
    const repoVideoPossible = path.resolve(path.join(__dirname, '..', filename));

    let copied = false;
    if (fs.existsSync(localVideoPossible)) {
      const outVideoAbs = path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, ''));
      copied = copyVideo(localVideoPossible, outVideoAbs);
    } else if (fs.existsSync(repoVideoPossible)) {
      const outVideoAbs = path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, ''));
      copied = copyVideo(repoVideoPossible, outVideoAbs);
    }

    if (copied) {
      const outPosterAbs = path.join(__dirname, '..', 'public', publicPosterPath.replace(/^\//, ''));
      if (!fs.existsSync(outPosterAbs)) {
        generatePoster(path.join(__dirname, '..', 'public', publicVideoPath.replace(/^\//, '')), outPosterAbs);
      }
    }

    entriesForFile.push({ filename: publicVideoPath, poster: publicPosterPath, caption });

    // mark that we saw a converted directive so it can be removed
    foundDirectives.push(b[0]);
  }

  while ((m = videoRegex.exec(raw)) !== null) {
    const rawDirective = m[0];
    foundDirectives.push(rawDirective);

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

    entriesForFile.push({ filename: publicVideoPath, poster: publicPosterPath, caption });
  }

  // If we found directives, remove them from the source markdown (backup first)
  if (foundDirectives.length > 0) {
    try {
      const backupDir = path.join(__dirname, '..', 'tmp', 'video-backups', slug);
      ensureDirSync(backupDir);
      const bakPath = path.join(backupDir, path.basename(filePath));
      fs.writeFileSync(bakPath, raw, 'utf8');

      // Remove all occurrences of the directives from the content (both original and converted forms)
      let cleaned = raw.replace(videoRegex, '');
      cleaned = cleaned.replace(brokenImgRegex, '');
      // write cleaned content back to the original file
      fs.writeFileSync(filePath, cleaned, 'utf8');
    } catch (e) {
      // non-fatal: if backup or write fails, continue
      console.error('Warning: failed to backup/clean file', filePath, e);
    }
  }

  // return entries for merging
  return { slug, entriesForFile, foundDirectives };
}

function walk(dir, cb) {
  const items = fs.readdirSync(dir, { encoding: 'utf8' });
  for (const it of items) {
    const p = path.join(dir, it);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, cb);
    else if (it.toLowerCase().endsWith('.md')) cb(p);
  }
}

let filesScanned = 0;
let totalFound = 0;
const newEntries = {};

walk(notesDir, (p) => {
  filesScanned++;
  const res = processFile(p);
  if (!res) return;

  const { slug, entriesForFile, foundDirectives } = res;
  if (entriesForFile && entriesForFile.length > 0) {
    newEntries[slug] = entriesForFile;
    totalFound += entriesForFile.length;
  }
});

// Merge new entries into existing index (do not wipe existing entries if none found)
for (const s of Object.keys(newEntries)) {
  index[s] = newEntries[s];
}

// If index is empty, attempt to rebuild from existing public/videos directory
if (Object.keys(index).length === 0) {
  try {
    const publicVideosDir = path.join(__dirname, '..', 'public', 'videos');
    if (fs.existsSync(publicVideosDir)) {
      const slugs = fs.readdirSync(publicVideosDir, { encoding: 'utf8' });
      for (const slugDir of slugs) {
        const fullDir = path.join(publicVideosDir, slugDir);
        try {
          const st = fs.statSync(fullDir);
          if (!st.isDirectory()) continue;
        } catch (e) {
          continue;
        }
        const vids = fs.readdirSync(fullDir, { encoding: 'utf8' }).filter(f => /\.(mp4|webm|mov|m4v)$/i.test(f));
        if (vids.length === 0) continue;
        index[slugDir] = vids.map(v => {
          const base = path.basename(v);
          return {
            filename: `/videos/${slugDir}/${base}`,
            poster: `/image/videos/${slugDir}/${path.basename(base, path.extname(base))}-thumb.jpg`,
            caption: null
          };
        });
      }
    }
  } catch (e) {
    // non-fatal
  }
}

// If parsing of existing index failed and we found no new entries, avoid overwriting the file.
if (parseFailed && Object.keys(newEntries).length === 0 && existingExisted) {
  console.log('Parse failed and no new entries discovered; leaving existing video_index.json untouched.');
  process.exit(0);
}

ensureDirSync(path.dirname(outData));
const tmpOut = outData + '.tmp';
fs.writeFileSync(tmpOut, JSON.stringify(index, null, 2), 'utf8');
fs.renameSync(tmpOut, outData);
console.log(`Scanned ${filesScanned} files. Found ${totalFound} new video entries.`);
console.log('Wrote video index to', outData, ' (total keys =', Object.keys(index).length + ')');