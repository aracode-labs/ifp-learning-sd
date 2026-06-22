ASR transcription options for `/public/audio/bacaan/ipa_dummy.MP3`

This project supports generating a timeline JSON (`ipa_dummy.json`) for the audio to be consumed by the Reading component.

Two recommended approaches:

1) OpenAI Transcription API (cloud)
- Requires an OpenAI API key in `OPENAI_API_KEY` env var.
- Example (curl):

  OPENAI_API_KEY=sk-... ./scripts/transcribe_with_openai_curl.sh public/audio/bacaan/ipa_dummy.MP3

- The script will POST the file and save the returned JSON newline-delimited response to `public/audio/bacaan/ipa_dummy.json`.

2) Local transcription with whisper (python)
- Requires Python, `pip install -U openai-whisper ffmpeg`.
- Example:

  ./scripts/transcribe_with_whisper_py.sh public/audio/bacaan/ipa_dummy.MP3

- This produces `public/audio/bacaan/ipa_dummy.json` containing `duration_ms` and `segments` with `start_ms`/`end_ms` and `text`.

Reading integration
- `src/components/Reading/Reading.tsx` will first try to fetch `/audio/bacaan/ipa_dummy.json`.
- If available it will use `segments` and `start_ms` for precise per-line timing.
- If not available it falls back to `/audio/bacaan/ipa_dummy.txt` and evenly divides the duration across sentences.

Next steps you can take:
- Run one of the scripts above to generate the JSON timeline file.
- Then start the dev server (`npm run dev`) and open `/bacaan` to preview.

Need help running these scripts on your machine? Tell me your OS and which option you prefer, and I can provide step-by-step commands.
