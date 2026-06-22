import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';
import './Evaluation.css';
import CharacterAnimator from '@/components/CharacterAnimator/CharacterAnimator';
import useKarakterFrames from '@/hooks/useKarakterFrames';
// character removed from evaluation layout

type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

// generate 10 simple sample questions
const sample: Question[] = Array.from({ length: 10 }).map((_, i) => {
  const a = i + 2;
  const b = (i % 4) + 1;
  const correct = a + b;
  const opts = [correct - 1, correct, correct + 1, correct + 2].map(String);
  return {
    id: `e${i + 1}`,
    prompt: `${i + 1}. Berapa hasil dari ${a} + ${b}?`,
    options: opts,
    answer: 1, // second option is correct
  } as Question;
});

type Props = { topicId?: string };

const Evaluation: React.FC<Props> = ({ topicId = '' }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  // timer in seconds (10 minutes default)
  const DEFAULT_SECONDS = 60 * 10;
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SECONDS);

  useEffect(() => {
    if (!started || submitted) return; // only run when started and not submitted
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // auto-submit when timer expires
          setSubmitted(true);
          setStarted(false);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, submitted]);

  const handleChoose = (qid: string, idx: number) => {
    setAnswers((s) => ({ ...s, [qid]: idx }));
  };

  const goto = (i: number) => setCurrent(i);

  const score = () => {
    return sample.reduce((acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc), 0);
  };

  const onSubmit = () => setSubmitted(true);

  const resetEvaluation = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
    setTimeLeft(DEFAULT_SECONDS);
    setStarted(false);
  };

  // use 40 frames (karakter_idle0001.png .. karakter_idle0040.png)
  const karakterFrames = useKarakterFrames();
  // karakterFrames removed — evaluation no longer shows character

  return (
    <div className="readingRoot evaluationRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>
        ← Kembali
      </button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Evaluasi: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Penilaian singkat untuk topik</p>
            <div className="evalTimer">Waktu tersisa: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>

          <div className="evalLayout">
            <div className="evalCharacter">
              <CharacterAnimator
                frames={karakterFrames}
                fps={12}
                autoplay={true}
                autoSize={true}
                scale={'80%'}
              />
            </div>
            <article className="readingCard evalBoard">
            {!submitted ? (
              !started ? (
                <div className="evalIntro">
                  <h2>Pengantar Evaluasi</h2>
                  <p>Silakan baca petunjuk berikut sebelum memulai. Anda akan mendapatkan {sample.length} soal. Waktu tersedia: {Math.floor(DEFAULT_SECONDS/60)} menit.</p>
                  <p>Kerjakan soal satu per satu. Gunakan tombol "Selanjutnya" dan "Sebelumnya" untuk berpindah. Tekan "Kirim Jawaban" ketika selesai.</p>
                  <div className="readingActions">
                    <button className="primary" onClick={() => { setStarted(true); setTimeLeft(DEFAULT_SECONDS); }}>Mulai Evaluasi</button>
                    <button onClick={() => navigate(-1)}>Batal</button>
                  </div>
                </div>
              ) : (
                <div className="evaluationLandscape">
                <div className="evalPanel">
                  <div className="evalPromptLarge">{sample[current].prompt}</div>
                  <div className="evalOptionsLarge">
                    {sample[current].options.map((opt, i) => (
                      <button key={i} className={`evalOptionLarge ${answers[sample[current].id] === i ? 'selected' : ''}`} onClick={() => handleChoose(sample[current].id, i)}>
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="readingActions">
                    <button className="primary" onClick={() => goto(Math.max(0, current - 1))} disabled={current === 0}>Sebelumnya</button>
                    {current + 1 < sample.length ? (
                      <button className="primary" onClick={() => goto(current + 1)}>Selanjutnya</button>
                    ) : (
                      <button className="primary" onClick={onSubmit}>Kirim Jawaban</button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="evalResult">
                <h2>Skor: {score()} / {sample.length}</h2>
                <p>Terima kasih. Anda dapat mengulang evaluasi jika ingin meningkatkan skor.</p>
                <div className="readingActions">
                  <button className="primary" onClick={resetEvaluation}>Ulangi</button>
                  <button onClick={() => navigate(-1)}>Kembali</button>
                </div>
              </div>
            )}
          </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
