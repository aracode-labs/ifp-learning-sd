# Transcription / SRT generation

This folder contains a simple helper to generate `.srt` subtitles from a plain text file and an audio file using `ffprobe` to determine audio duration.

Requirements
- `node` (14+)
- `ffmpeg` / `ffprobe` available on your PATH (install via Homebrew: `brew install ffmpeg`)

Script
- `scripts/txt-to-srt.js` — Node script that reads a text file, splits it into sentence-like segments, uses `ffprobe` to get the audio duration, and writes an `.srt` with evenly distributed timestamps. This is a quick, approximate generator (useful for prototyping).

Quick usage

1. Make sure `ffprobe` is installed and available:

```bash
ffprobe -version
```

2. Generate an `.srt` from a text and audio file:

```bash
node scripts/txt-to-srt.js public/audio/bacaan/ipa_dummy.txt public/audio/bacaan/ipa_dummy.MP3 public/audio/bacaan/ipa_dummy.srt
```

Notes and next steps
- The generated `.srt` uses uniform segmentation and is only a coarse approximation. For higher accuracy consider:
  - Running an ASR (Whisper, VOSK) and converting the timestamps to `.srt`.
  - Using a forced-alignment tool (Montreal Forced Aligner) with a transcript to get word- or phrase-level timings.

- The app's `Reading` component will prefer a sibling `.srt` (`ipa_dummy.srt`) if present; otherwise it falls back to uniform segmentation from the text file.

If you want, I can: run the generator for `ipa_dummy` now, or add an ASR-based pipeline next.
