#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  const root = path.resolve(process.cwd(), 'public', 'content');
  const outRoot = path.resolve(process.cwd(), 'public', 'content', 'reading');
  const defaultAudio = '/audio/bacaan/ipa_dummy.MP3';
  const defaultTxt = '/audio/bacaan/ipa_dummy.txt';
  const defaultSrt = '/audio/bacaan/ipa_dummy.srt';

  const classes = await fs.readdir(root, { withFileTypes: true });
  for (const c of classes) {
    if (!c.isDirectory()) continue;
    const classPath = path.join(root, c.name);
    const subjects = await fs.readdir(classPath, { withFileTypes: true });
    for (const s of subjects) {
      if (!s.isDirectory()) continue;
      const subject = s.name; // e.g. 'ipa'
      const subjectPath = path.join(classPath, subject);
      const items = await fs.readdir(subjectPath, { withFileTypes: true });
      for (const it of items) {
        if (!it.isDirectory()) continue;
        const name = it.name; // e.g. 'topik-1'
        const m = name.match(/^topik-(\d+)$/i);
        if (!m) continue;
        const num = m[1];
        const topicId = `${subject}-${num}`; // e.g. 'ipa-1'

        const destDir = outRoot; // top-level under reading
        const destFile = path.join(destDir, `${topicId}.json`);
        if (await exists(destFile)) continue; // don't overwrite

        await fs.mkdir(destDir, { recursive: true });
        const payload = {
          title: `${subject.toUpperCase()} - Topik ${num}`,
          audio: defaultAudio,
          txt: defaultTxt,
          srt: defaultSrt,
        };
        await fs.writeFile(destFile, JSON.stringify(payload, null, 2), 'utf8');
        console.log('Created', path.relative(process.cwd(), destFile));
      }
    }
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
