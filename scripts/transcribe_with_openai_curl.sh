#!/usr/bin/env bash
# Usage: OPENAI_API_KEY=sk-... ./transcribe_with_openai_curl.sh /path/to/ipa_dummy.MP3
# Produces ipa_dummy.json in the same folder (if successful)

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/audio.mp3"
  exit 1
fi

AUDIO="$1"
OUTDIR="$(dirname "$AUDIO")"
OUTJSON="$OUTDIR/$(basename "$AUDIO" .mp3).json"

if [ -z "$OPENAI_API_KEY" ]; then
  echo "Please set OPENAI_API_KEY environment variable."
  exit 1
fi

echo "Uploading $AUDIO to OpenAI Transcriptions..."

curl -s -X POST "https://api.openai.com/v1/audio/transcriptions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@"$AUDIO" \
  -F model=whisper-1 \
  -F response_format=jsonl \
  -o "$OUTJSON"

if [ $? -eq 0 ]; then
  echo "Transcription saved to $OUTJSON"
else
  echo "Transcription failed"
fi
