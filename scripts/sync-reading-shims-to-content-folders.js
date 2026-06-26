#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  const contentRoot = path.resolve(process.cwd(), 'public', 'content');
  const readingRoot = path.join(contentRoot, 'reading');

  const classes = await fs.readdir(contentRoot, { withFileTypes: true });
  for (const c of classes) {
    if (!c.isDirectory() || c.name === 'reading' || c.name === 'thumbnail' ) continue;
    const classPath = path.join(contentRoot, c.name);
    const subjects = await fs.readdir(classPath, { withFileTypes: true });
    for (const s of subjects) {
      if (!s.isDirectory()) continue;
      const subject = s.name; // e.g. 'agama'
      const subjectPath = path.join(classPath, subject);
      const items = await fs.readdir(subjectPath, { withFileTypes: true });
      for (const it of items) {
        if (!it.isDirectory()) continue;
        const name = it.name; // e.g. 'topik-1'
        const m = name.match(/^topik-(\d+)$/i);
        if (!m) continue;
        const num = m[1];
        const topicId = `${subject}-${num}`; // e.g. 'agama-1'

        const src = path.join(readingRoot, `${topicId}.json`);
        if (!(await exists(src))) continue;

        const destFile = path.join(subjectPath, `${topicId}.json`);
        if (await exists(destFile)) continue; // don't overwrite

        const data = await fs.readFile(src, 'utf8');
        await fs.writeFile(destFile, data, 'utf8');
        console.log('Copied', path.relative(process.cwd(), src), '->', path.relative(process.cwd(), destFile));
      }
    }
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
