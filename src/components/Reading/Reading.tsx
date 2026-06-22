import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterAnimator from '@/components/CharacterAnimator/CharacterAnimator';
import useKarakterFrames from '@/hooks/useKarakterFrames';
import './Reading.css';

type TextLine = {
  text: string;
  startTime: number; // in milliseconds
  endTime?: number; // optional end time in ms
};

// We'll load the source text from public/audio/bacaan/ipa_dummy.txt
// and split into sentences/lines, then compute startTime after audio metadata loads

type ReadingProps = { topicId?: string };

const Reading: React.FC<ReadingProps> = ({ topicId }) => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lines, setLines] = useState<TextLine[]>([]);
  // loadingText removed — we don't need an explicit loading flag
  const [durationMs, setDurationMs] = useState<number>(0);
  const [audioSrc, setAudioSrc] = useState<string>('/audio/bacaan/ipa_dummy.MP3');
  const [txtPath, setTxtPath] = useState<string>('/audio/bacaan/ipa_dummy.txt');
  const [srtPath, setSrtPath] = useState<string>('/audio/bacaan/ipa_dummy.srt');
  const [title, setTitle] = useState<string>('Modul Bacaan');

  const karakterFrames = useKarakterFrames();

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

    // Attempt to load content config for this topicId.
    // Prefer a config placed alongside topic content under class folders (e.g. /content/kelas1-semester1/<subject>/<topicId>.json)
    // before falling back to the top-level /content/reading shims.
    const tryLoadContentConfig = async () => {
      if (!topicId) return false;
      const tried: string[] = [];
      const candidates: string[] = [];

      // If topicId like 'ipa-3', extract subject
      const m = topicId.match(/^([a-zA-Z0-9_\s]+)-/);
      const subject = m ? m[1] : null;

      // Known class folders in public/content — try them first (prefer in-folder JSONs)
      const classDirs = [
        'kelas1-semester1','kelas1-semester2',
        'kelas2-semester1','kelas2-semester2',
        'kelas3-semester1','kelas3-semester2',
        'kelas4-semester1','kelas4-semester2',
        'kelas5-semester1','kelas5-semester2',
        'kelas6-semester1','kelas6-semester2'
      ];

      if (subject) {
        for (const cd of classDirs) {
          candidates.push(`/content/${cd}/${subject}/${topicId}.json`);
          candidates.push(`/content/${cd}/${subject}/${subject}-${topicId.replace(/^.*?-/, '')}.json`);
        }
      }

      // Also try subject-level config inside class folders (e.g. /content/kelas1-semester1/ipa.json)
      if (subject) {
        for (const cd of classDirs) {
          candidates.push(`/content/${cd}/${subject}.json`);
        }
      }

      // Finally fall back to the reading shims we generated
      candidates.push(`/content/reading/${topicId}.json`);
      if (subject) {
        candidates.push(`/content/reading/${subject}/${topicId}.json`);
        candidates.push(`/content/reading/${subject}.json`);
      }

      for (const p of candidates) {
        tried.push(p);
        try {
          const cfgResp = await fetch(p);
          if (!cfgResp.ok) continue;
          const cfg = await cfgResp.json();
          if (!mounted) return true;
          if (cfg.title) setTitle(cfg.title);
          else setTitle(`Bacaan: ${topicId}`);
          if (cfg.audio) setAudioSrc(cfg.audio);
          if (cfg.txt) setTxtPath(cfg.txt);
          if (cfg.srt) setSrtPath(cfg.srt);
          return true;
        } catch (e) {
          continue;
        }
      }
      return false;
    };

    // Try to load .srt (from srtPath) then fall back to txtPath
    const tryLoadSrtOrTxt = async () => {
      try {
        const srtResp = await fetch(srtPath);
        if (srtResp.ok) {
          const srtText = await srtResp.text();
          if (!mounted) return;
          const parsed = parseSrt(srtText);
          setLines(parsed);
          return;
        }
      } catch (e) {
        // ignore
      }

      // fallback to txtPath
      try {
        const res = await fetch(txtPath);
        const txt = await res.text();
        if (!mounted) return;
        const cleaned = txt.replace(/\s+/g, ' ').trim();
        const parts = cleaned.split(/(?<=[\.!?])\s+/).map(s => s.trim()).filter(Boolean);
        const initial: TextLine[] = parts.map((p) => ({ text: p, startTime: 0 }));
        setLines(initial);
      } catch (e) {
        if (!mounted) return;
        setLines([]);
      }
    };

    (async () => {
      await tryLoadContentConfig();
      await tryLoadSrtOrTxt();
    })();

    return () => { mounted = false; };
  }, [topicId]);


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
            <h1 className="readingTitle">{title}</h1>
            <p className="readingMeta">Baca dengan panduan audio</p>
          </div>

          {/* absolute-positioned character sits outside the reading card */}
          <div className="readingCharacter">
            <CharacterAnimator
              frames={karakterFrames}
              fps={12}
              autoplay={true}
              autoSize={true}
              scale={'90%'}
            />
          </div>
          <article className="readingCard">
            {/* Audio player */}
            <div className="audioPlayerWrap">
              <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
              />

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
                  lines.map((line, idx) => {
                    const start = line.startTime ?? 0;
                    const end = line.endTime ?? durationMs ?? (start + 1000);
                    const isPast = currentTime >= end;
                    const isCurrent = currentTime >= start && currentTime < end;

                    if (!isCurrent) {
                      return (
                        <p
                          key={idx}
                          className={`textLine ${isPast ? 'past' : ''}`}
                          onClick={() => {
                            const audio = audioRef.current;
                            if (audio) {
                              audio.currentTime = start / 1000;
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
                    const words = line.text.split(/(\s+)/).filter(Boolean);
                    const elapsed = Math.max(0, Math.min(end - start, currentTime - start));
                    const cueDur = Math.max(1, end - start);
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

            {/* Play controls moved below text */}
            <div className="readingControls">
              <button className="playButton" onClick={handlePlayPause}>
                {isPlaying ? '⏸ Jeda' : '▶ Putar'}
              </button>
              <button className="resetButton" onClick={handleReset}>
                🔄 Reset
              </button>
              <div className="audioTime">
                {Math.floor(currentTime / 1000)}s
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Reading;
