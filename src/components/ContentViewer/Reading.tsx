import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';

type Props = {
  topicId: string;
};

const Reading: React.FC<Props> = ({ topicId }) => {
  const navigate = useNavigate();

  return (
    <div className="readingRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>
        ← Kembali
      </button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Bacaan: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Materi pembelajaran — Bacaan interaktif</p>
          </div>

          <article className="readingCard">
            <h2>Penjelasan singkat</h2>
            <p>
              Ini adalah template bacaan untuk topik <strong>{topicId}</strong>. Gunakan komponen ini
              sebagai dasar untuk menampilkan teks, gambar, atau aktivitas membaca.
            </p>

            <h3>Contoh isi</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse
              lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum
              ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.
            </p>

            <div className="readingActions">
              <button className="primary">Lanjutkan</button>
              <button>Daftar Isi</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Reading;
