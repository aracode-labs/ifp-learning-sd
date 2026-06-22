import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';

type TextLine = {
  text: string;
  startTime: number; // in milliseconds
  endTime?: number; // optional end time in ms
};

// We'll load the source text from public/audio/bacaan/ipa_dummy.txt
// and split into sentences/lines, then compute startTime after audio metadata loads

const Reading: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lines, setLines] = useState<TextLine[]>([]);
  // loadingText removed — we don't need an explicit loading flag
  const [durationMs, setDurationMs] = useState<number>(0);

  // Determine which line(s) should be displayed based on current audio time
  useEffect(() => {
    let index = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentTime >= lines[i].startTime) {
        index = i;
        break;
      }
    }
    setCurrentLineIndex(index);
  }, [currentTime, lines]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime * 1000); // convert to ms
    }
  };

  // load source text and split into sentences/lines
  useEffect(() => {
    let mounted = true;

    // Try to load .srt first (same base name as audio/text)
    const tryLoadSrt = async () => {
      try {
        const srtResp = await fetch('/audio/bacaan/ipa_dummy.srt');
        if (srtResp.ok) {
          const srtText = await srtResp.text();
          if (!mounted) return;
          const parsed = parseSrt(srtText);
          setLines(parsed);
          return true;
        }
      } catch (e) {
        // ignore and fallback
      }
      return false;
    };

    const loadTxtFallback = async () => {
      try {
        const res = await fetch('/audio/bacaan/ipa_dummy.txt');
        const txt = await res.text();
        if (!mounted) return;
        const cleaned = txt.replace(/\s+/g, ' ').trim();
        // split into sentences using punctuation (., ?, ?) followed by space
        const parts = cleaned.split(/(?<=[\.\?\!])\s+/).map(s => s.trim()).filter(Boolean);
        // initialize with placeholder startTime=0; actual startTime assigned on metadata
        const initial: TextLine[] = parts.map((p) => ({ text: p, startTime: 0 }));
        setLines(initial);
      } catch (e) {
        if (!mounted) return;
        setLines([]);
      } finally {
        // noop
      }
    };

    (async () => {
      const srtLoaded = await tryLoadSrt();
      if (!srtLoaded) await loadTxtFallback();
    })();

    return () => { mounted = false; };
  }, []);


  // parse a simple SRT file and return TextLine[] using the start time of each cue
  function parseSrt(srt: string): TextLine[] {
    const blocks = srt.split(/\r?\n\r?\n/).map(b => b.trim()).filter(Boolean);
    const out: TextLine[] = [];
    for (const block of blocks) {
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;
      // lines[0] may be index; lines[1] is timing
      let timingLine = lines[1];
      if (!/-->/.test(timingLine) && lines.length >= 3) {
        timingLine = lines[2];
      }
      const match = timingLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
      if (!match) continue;
      const start = srtTimeToMs(match[1]);
      const end = srtTimeToMs(match[2]);
      const text = lines.slice(lines.indexOf(timingLine) + 1).join(' ');
      out.push({ text, startTime: start, endTime: end });
    }
    return out;
  }

  function srtTimeToMs(t: string): number {
    // format HH:MM:SS,ms
    const m = t.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!m) return 0;
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ss = parseInt(m[3], 10);
    const ms = parseInt(m[4], 10);
    return ((hh * 3600) + (mm * 60) + ss) * 1000 + ms;
  }

  // when audio metadata loads, compute per-line start times by dividing duration
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const durMs = (audio.duration || 0) * 1000;
    setDurationMs(durMs);
    if (!lines.length || durMs <= 0) return;
    // If lines already have timing (from .srt), don't overwrite them.
    const hasTiming = lines.some(ln => ln.endTime && ln.endTime > 0);
    if (hasTiming) {
      // ensure any missing endTime values are set (use next start or duration)
      const filled = lines.map((ln, i) => {
        if (ln.endTime && ln.endTime > 0) return ln;
        const next = lines[i+1];
        const end = next ? next.startTime : durMs;
        return { ...ln, endTime: end };
      });
      setLines(filled);
      return;
    }

    const segment = Math.max(200, Math.floor(durMs / lines.length));
    const mapped = lines.map((ln, i) => ({ ...ln, startTime: i * segment, endTime: i === lines.length - 1 ? durMs : (i+1)*segment }));
    setLines(mapped);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      setCurrentLineIndex(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="readingRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>
        ← Kembali
      </button>

      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Modul Bacaan</h1>
            <p className="readingMeta">Baca dengan panduan audio</p>
          </div>

          <article className="readingCard">
            {/* Audio player */}
            <div className="audioPlayerWrap">
              <audio
                ref={audioRef}
                src="/audio/bacaan/ipa_dummy.MP3"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
              />
              <div className="audioControls">
                <button className="playButton" onClick={handlePlayPause}>
                  {isPlaying ? '⏸ Jeda' : '▶ Putar'}
                </button>
                <button className="resetButton" onClick={handleReset}>
                  🔄 Reset
                </button>
              </div>
              <div className="audioTime">
                {Math.floor(currentTime / 1000)}s
              </div>
            

            {/* progress bar */}
            <div className="audioProgress" onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = (e as React.MouseEvent).clientX - rect.left;
              const pct = Math.max(0, Math.min(1, x / rect.width));
              const audio = audioRef.current;
              if (audio && durationMs > 0) {
                audio.currentTime = (pct * durationMs) / 1000;
                setCurrentTime(audio.currentTime * 1000);
              }
            }}>
              <div className="audioProgressBar" style={{ width: durationMs > 0 ? `${Math.min(100, (currentTime / durationMs) * 100)}%` : '0%' }} />
            </div>
            </div>

            {/* Text display area */}
            <div className="textDisplay">
              <div className="textContainer">
                {/* Display all lines up to current index */}
                {lines.length ? (
                  lines.slice(0, currentLineIndex + 1).map((line, idx) => {
                    const isCurrent = idx === currentLineIndex;
                    if (!isCurrent) {
                      return (
                        <p
                          key={idx}
                          className={`textLine past`}
                          onClick={() => {
                            const audio = audioRef.current;
                            if (audio) {
                              audio.currentTime = line.startTime / 1000;
                              setCurrentTime(audio.currentTime * 1000);
                              if (!isPlaying) {
                                audio.play();
                                setIsPlaying(true);
                              }
                            }
                          }}
                        >
                          {line.text}
                        </p>
                      );
                    }

                    // current line — render words with per-word timing
                    const start = line.startTime || 0;
                    const end = line.endTime || (durationMs || start + 1000);
                    const words = line.text.split(/(\s+)/).filter(Boolean); // keep spaces so we can render them
                    // compute elapsed within this cue
                    const elapsed = Math.max(0, Math.min(end - start, currentTime - start));
                    const cueDur = Math.max(1, end - start);
                    // determine which non-space token index is current
                    const tokenIndices = words.map((w, i) => ({ w, i, isSpace: /^\s+$/.test(w) }));
                    const nonSpaceCount = tokenIndices.filter(t => !t.isSpace).length || 1;
                    const wordIdx = Math.floor((elapsed / cueDur) * nonSpaceCount);
                    let seen = -1;

                    return (
                      <p key={idx} className={`textLine current`}>
                        {tokenIndices.map((tok) => {
                          if (tok.isSpace) return <span key={tok.i}>{tok.w}</span>;
                          seen++;
                          const isWordCurrent = seen === wordIdx;
                          const wordStart = start + (seen * cueDur) / nonSpaceCount;
                          return (
                            <span
                              key={tok.i}
                              className={`word ${isWordCurrent ? 'currentWord' : ''}`}
                              onClick={() => {
                                const audio = audioRef.current;
                                if (audio) {
                                  audio.currentTime = wordStart / 1000;
                                  setCurrentTime(audio.currentTime * 1000);
                                  if (!isPlaying) {
                                    audio.play();
                                    setIsPlaying(true);
                                  }
                                }
                              }}
                            >
                              {tok.w}
                            </span>
                          );
                        })}
                      </p>
                    );
                  })
                ) : (
                  <p className="textLine prompt">Memuat teks...</p>
                )}
                {/* If no lines yet, show prompt */}
                {currentLineIndex === 0 && currentTime === 0 && (
                  <p className="textLine prompt">Tekan tombol Putar untuk memulai...</p>
                )}
              </div>
            </div>

            {/* Info box */}
            <div className="infoBox">
              <p><strong>Baris saat ini:</strong> {Math.min(lines.length, currentLineIndex + 1)} dari {lines.length}</p>
            </div>

            <div className="readingActions">
              <button className="primary" onClick={() => navigate(-1)}>Kembali</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Reading;
