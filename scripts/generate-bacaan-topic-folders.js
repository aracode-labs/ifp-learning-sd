#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function copyFolder(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(srcPath, destPath);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

async function removeDirectory(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function cleanBacaanRoot(outputRoot) {
  const entries = await fs.readdir(outputRoot, { withFileTypes: true });
  let removed = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name === 'default' || name === 'reading' || /^kelas[1-6]-semester[12]$/.test(name)) continue;
    const fullPath = path.join(outputRoot, name);
    await removeDirectory(fullPath);
    console.log('Removed stale root folder:', name);
    removed += 1;
  }
  return removed;
}

function slugTopicId(fileName) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

async function walkJsonFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeContentFilePath(value) {
  if (!value || typeof value !== 'string') return value;
  if (value.startsWith('/audio/bacaan/')) {
    return value.replace('/audio/bacaan', '/bacaan/default');
  }
  if (value.startsWith('audio/bacaan/')) {
    return value.replace('audio/bacaan', '/bacaan/default');
  }
  return value;
}

async function main() {
  const root = process.cwd();
  const contentDir = path.resolve(root, 'public', 'content');
  const defaultDir = path.resolve(root, 'public', 'bacaan', 'default');
  const outputRoot = path.resolve(root, 'public', 'bacaan');

  if (!(await exists(defaultDir))) {
    console.error('Default bacaan folder not found:', defaultDir);
    process.exit(1);
  }

  const jsonFiles = await walkJsonFiles(contentDir);
  let created = 0;
  let updated = 0;

  for (const filePath of jsonFiles) {
    const relative = path.relative(contentDir, filePath).replace(/\\/g, '/');
    if (!relative.startsWith('kelas') && !relative.startsWith('reading/')) continue;
    if (relative === 'flow-program.json' || relative === 'menu-utama.json') continue;

    const raw = await fs.readFile(filePath, 'utf8');
    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.warn('Skipping invalid JSON:', relative);
      continue;
    }

    const topicName = path.basename(filePath, '.json');
    const topicId = slugTopicId(topicName);
    const relativeDir = path.dirname(relative);
    let folderName = topicId;

    // If the content folder has a matching topik-N directory, use that folder name.
    const matchNumber = topicId.match(/-(\d+)$/);
    if (matchNumber && relativeDir.startsWith('kelas')) {
      const topikFolder = `topik-${matchNumber[1]}`;
      const candidateDir = path.join(contentDir, relativeDir, topikFolder);
      if (await exists(candidateDir)) {
        folderName = topikFolder;
      }
    }

    // If the topic JSON sits directly inside a subject folder and the topic directory
    // is named after the topic ID (e.g. agama-1.json -> agama-1 folder), use that.
    const directTopicDir = path.join(outputRoot, relativeDir, topicId);
    if (await exists(path.join(contentDir, relativeDir, topicId))) {
      folderName = topicId;
    }

    const destDir = path.join(outputRoot, relativeDir, folderName);
    await ensureDir(destDir);

    const audioTarget = path.join(destDir, `${topicId}.mp3`);
    const txtTarget = path.join(destDir, `${topicId}.txt`);
    const srtTarget = path.join(destDir, `${topicId}.srt`);
    const slidesTarget = path.join(destDir, 'slides');

    await copyFile(path.join(defaultDir, 'ipa_dummy.MP3'), audioTarget);
    await copyFile(path.join(defaultDir, 'ipa_dummy.txt'), txtTarget);
    await copyFile(path.join(defaultDir, 'ipa_dummy.srt'), srtTarget);
    if (await exists(path.join(defaultDir, 'slides'))) {
      await copyFolder(path.join(defaultDir, 'slides'), slidesTarget);
    }

    created += 1;

    const pathPrefix = `/bacaan/${relativeDir}/${folderName}`.replace(/\\/g, '/');
    const expectedAudio = `${pathPrefix}/${topicId}.mp3`;
    const expectedTxt = `${pathPrefix}/${topicId}.txt`;
    const expectedSrt = `${pathPrefix}/${topicId}.srt`;
    const expectedSlides = `${pathPrefix}/slides`;

    let changed = false;
    if (json.audio !== expectedAudio) {
      json.audio = expectedAudio;
      changed = true;
    }
    if (json.txt !== expectedTxt) {
      json.txt = expectedTxt;
      changed = true;
    }
    if (json.srt !== expectedSrt) {
      json.srt = expectedSrt;
      changed = true;
    }
    if (json.slides !== expectedSlides) {
      json.slides = expectedSlides;
      changed = true;
    }

    if (changed) {
      await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      updated += 1;
    }
  }

  const removed = await cleanBacaanRoot(outputRoot);
  console.log(`Done. Created ${created} topic folders, updated ${updated} JSON files, removed ${removed} stale root folders.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
