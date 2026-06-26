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

async function walkJsonFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeDefaultAssetPath(value) {
  if (!value || typeof value !== 'string') return undefined;
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
  const defaultAudio = '/bacaan/default/ipa_dummy.MP3';
  const defaultTxt = '/bacaan/default/ipa_dummy.txt';
  const defaultSrt = '/bacaan/default/ipa_dummy.srt';
  const defaultSlides = '/bacaan/default/slides';

  if (!(await exists(contentDir))) {
    console.error('content directory not found:', contentDir);
    process.exit(1);
  }

  const files = await walkJsonFiles(contentDir);
  let patched = 0;
  for (const file of files) {
    const relativeToContent = path.relative(contentDir, file).replace(/\\/g, '/');
    if (!/^kelas[1-6]-semester[12]\//.test(relativeToContent)) continue;
    if (relativeToContent.startsWith('reading/')) continue;

    const rel = path.relative(root, file);
    const raw = await fs.readFile(file, 'utf8');
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch (err) {
      console.warn('Skipping invalid JSON:', rel);
      continue;
    }

    let changed = false;
    const result = { ...cfg };

    if (!result.audio) {
      result.audio = defaultAudio;
      changed = true;
    } else {
      const normalized = normalizeDefaultAssetPath(result.audio);
      if (normalized && normalized !== result.audio) {
        result.audio = normalized;
        changed = true;
      }
    }

    if (!result.txt) {
      result.txt = defaultTxt;
      changed = true;
    } else {
      const normalized = normalizeDefaultAssetPath(result.txt);
      if (normalized && normalized !== result.txt) {
        result.txt = normalized;
        changed = true;
      }
    }

    if (!result.srt) {
      result.srt = defaultSrt;
      changed = true;
    } else {
      const normalized = normalizeDefaultAssetPath(result.srt);
      if (normalized && normalized !== result.srt) {
        result.srt = normalized;
        changed = true;
      }
    }

    if (!result.slides) {
      result.slides = defaultSlides;
      changed = true;
    } else {
      const normalized = normalizeDefaultAssetPath(result.slides);
      if (normalized && normalized !== result.slides) {
        result.slides = normalized;
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, JSON.stringify(result, null, 2), 'utf8');
      console.log('Patched', rel);
      patched += 1;
    }
  }

  console.log(`Done. Patched ${patched} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
