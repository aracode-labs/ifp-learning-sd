#!/usr/bin/env bash
# Example using OpenAI's whisper python package (local transcription)
# Requires: pip install -U openai-whisper ffmpeg
# Usage: ./transcribe_with_whisper_py.sh /path/to/ipa_dummy.MP3

AUDIO="$1"
if [ -z "$AUDIO" ]; then
  echo "Usage: $0 /path/to/audio.mp3"
  exit 1
fi

python - <<'PY'
import whisper, json, sys
model = whisper.load_model('small')
result = model.transcribe(sys.argv[1])
# result has 'segments' with start/end in seconds and text
segments = []
for seg in result.get('segments', []):
    segments.append({'text': seg.get('text','').strip(), 'start_ms': int(seg.get('start',0)*1000), 'end_ms': int(seg.get('end',0)*1000)})
out = {'duration_ms': int(result.get('duration',0)*1000), 'segments': segments}
with open(sys.argv[1].rsplit('.',1)[0]+'.json','w',encoding='utf-8') as f:
    json.dump(out,f,ensure_ascii=False,indent=2)
print('Wrote JSON:', sys.argv[1].rsplit('.',1)[0]+'.json')
PY
