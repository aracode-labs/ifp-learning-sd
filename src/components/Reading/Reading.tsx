import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';

type TextLine = {
  text: string;
  startTime: number; // in milliseconds
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
  const [loadingText, setLoadingText] = useState(true);
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
    // prefer a precomputed JSON timeline if available
    fetch('/audio/bacaan/ipa_dummy.json')
      .then((res) => {
        if (!mounted) return null;
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        if (json && Array.isArray(json.segments) && json.segments.length) {
          // expected format: { segments: [{ text, start_ms, end_ms }, ...] }
          const mapped: TextLine[] = json.segments.map((s: any) => ({ text: String(s.text || '').trim(), startTime: Number(s.start_ms || s.start || 0) }));
          setLines(mapped);
          setLoadingText(false);
          return;
        }
        // fallback to plain text
        return fetch('/audio/bacaan/ipa_dummy.txt').then((r) => r.text()).then((txt) => {
          if (!mounted) return;
          const cleaned = txt.replace(/\s+/g, ' ').trim();
          const parts = cleaned.split(/(?<=[\.\?\!])\s+/).map((s) => s.trim()).filter(Boolean);
          const initial: TextLine[] = parts.map((p) => ({ text: p, startTime: 0 }));
          setLines(initial);
          setLoadingText(false);
        });
      })
      .catch(() => {
        if (!mounted) return;
        setLines([]);
        setLoadingText(false);
      });
    return () => { mounted = false; };
  }, []);

  // when audio metadata loads, compute per-line start times by dividing duration
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const durMs = (audio.duration || 0) * 1000;
    setDurationMs(durMs);
    if (!lines.length || durMs <= 0) return;
    const segment = Math.max(200, Math.floor(durMs / lines.length));
    const mapped = lines.map((ln, i) => ({ ...ln, startTime: i * segment }));
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
                  lines.slice(0, currentLineIndex + 1).map((line, idx) => (
                    <p
                      key={idx}
                      className={`textLine ${idx === currentLineIndex ? 'current' : 'past'}`}
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
                  ))
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
