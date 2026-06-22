import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';
import './Quiz.css';

type Question = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

type Props = {
  topicId?: string;
};

const sampleQuestions: Question[] = [
  {
    id: 'q1',
    question: 'Berapa hasil dari 2 + 3?',
    choices: ['3', '4', '5', '6'],
    answerIndex: 2,
  },
  {
    id: 'q2',
    question: 'Berapakah 7 - 2?',
    choices: ['4', '5', '6', '3'],
    answerIndex: 1,
  },
];

const Quiz: React.FC<Props> = ({ topicId = '' }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = sampleQuestions; // placeholder; later load per topic

  const current = questions[index];

  const choose = (i: number) => {
    if (selected != null) return; // already answered
    setSelected(i);
    if (i === current.answerIndex) setScore((s) => s + 1);
  };

  const next = () => {
    const nextIdx = index + 1;
    setSelected(null);
    if (nextIdx >= questions.length) {
      setFinished(true);
    } else {
      setIndex(nextIdx);
    }
  };

  return (
    <div className="readingRoot quizRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>
        ← Kembali
      </button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Kuis: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Tes pemahaman singkat</p>
          </div>

          <article className="readingCard">
            {!finished ? (
              <div className="quizRoot">
                <div className="quizQuestion">{current.question}</div>
                <div className="quizChoices">
                  {current.choices.map((c, i) => (
                    <button
                      key={i}
                      className={`quizChoice ${selected != null ? (i === current.answerIndex ? 'correct' : i === selected ? 'wrong' : '') : ''}`}
                      onClick={() => choose(i)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="readingActions">
                  <button className="primary" onClick={next} disabled={selected == null}>
                    {index + 1 < questions.length ? 'Selanjutnya' : 'Selesai'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="quizResult">
                <h2>Hasil: {score} / {questions.length}</h2>
                <p>Terima kasih! Anda dapat mengulang kuis atau kembali ke materi.</p>
                <div className="readingActions">
                  <button className="primary" onClick={() => { setIndex(0); setScore(0); setFinished(false); setSelected(null); }}>
                    Ulangi
                  </button>
                  <button onClick={() => navigate(-1)}>Kembali</button>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
