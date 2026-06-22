#!/usr/bin/env node
import fs from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Allow usage similar to CommonJS __dirname if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.log('Usage: node scripts/txt-to-srt.js <input.txt> <input.mp3|wav> <output.srt> [minSegmentMs]');
  process.exit(1);
}

function msToSrt(ms) {
  const total = Math.max(0, Math.floor(ms));
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(hours,2)}:${pad(minutes)}:${pad(seconds)},${String(millis).padStart(3,'0')}`;
}

function getAudioDurationMs(file) {
  return new Promise((resolve, reject) => {
    // ffprobe must be installed and on PATH
    exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`, (err, stdout, stderr) => {
      if (err) return reject(err);
      const s = stdout && stdout.toString().trim();
      const num = parseFloat(s);
      if (Number.isFinite(num)) resolve(Math.round(num * 1000));
      else reject(new Error('Could not parse duration: ' + s));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) usage();
  const [txtPath, audioPath, outPath] = args;
  const minSegment = parseInt(args[3], 10) || 200; // ms

  try {
    const txt = await fs.readFile(txtPath, 'utf8');
    const cleaned = txt.replace(/\s+/g, ' ').trim();
    // split into sentences by punctuation . ? ! or newline
    const parts = cleaned.split(/(?<=[\.\?\!])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error('No text parts found');

    const durationMs = await getAudioDurationMs(audioPath);
    const segment = Math.max(minSegment, Math.floor(durationMs / parts.length));

    let srt = '';
    for (let i = 0; i < parts.length; i++) {
      const start = i * segment;
      const end = i === parts.length -1 ? durationMs : (start + segment);
      srt += `${i+1}\n${msToSrt(start)} --> ${msToSrt(end)}\n${parts[i]}\n\n`;
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, srt, 'utf8');
    console.log('Wrote', outPath);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

main().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
