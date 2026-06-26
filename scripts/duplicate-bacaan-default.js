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

async function copyFolder(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
      console.log('Copied', path.relative(process.cwd(), destPath));
    }
  }
}

async function main() {
  const root = process.cwd();
  const source = path.resolve(root, 'public', 'audio', 'bacaan');
  const destination = path.resolve(root, 'public', 'bacaan', 'default');

  if (process.argv.includes('--help')) {
    console.log('Usage: node scripts/duplicate-bacaan-default.js');
    console.log('Copies the default bacaan audio/text/srt and slides assets from public/audio/bacaan to public/bacaan/default.');
    process.exit(0);
  }

  if (!(await exists(source))) {
    console.error('Source folder not found:', source);
    process.exit(1);
  }

  await copyFolder(source, destination);
  console.log('Default bacaan assets copied to:', destination);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
