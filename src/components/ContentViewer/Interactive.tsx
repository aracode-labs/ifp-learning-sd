import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';
import './Interactive.css';

type Props = { topicId?: string };

const Interactive: React.FC<Props> = ({ topicId = '' }) => {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);

  return (
    <div className="readingRoot interactiveRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>← Kembali</button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Interaktif: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Eksperimen interaktif dan simulasi</p>
          </div>

          <article className="readingCard">
            <div className="interactiveArea">
              {!running ? (
                <div className="interactivePlaceholder">
                  <p>Area interaktif untuk topik <strong>{topicId}</strong></p>
                  <p className="muted">(Canvas / simulator akan muncul di sini)</p>
                  <button className="primary" onClick={() => setRunning(true)}>Mulai Simulasi</button>
                </div>
              ) : (
                <div className="interactiveRunning">
                  <div className="simCanvas" />
                  <div className="simControls">
                    <button onClick={() => setRunning(false)}>Hentikan</button>
                    <button className="primary">Reset</button>
                  </div>
                </div>
              )}
            </div>

            <h3>Petunjuk</h3>
            <p>Ikuti instruksi yang ada pada simulasi. Ini adalah template — integrasikan logika interaktif sesuai kebutuhan topik.</p>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Interactive;
