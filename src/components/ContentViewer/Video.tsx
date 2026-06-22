import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reading.css';
import './Video.css';

type Props = {
  topicId?: string;
};

const Video: React.FC<Props> = ({ topicId = '' }) => {
  const navigate = useNavigate();
  // candidate video path inside public folder
  const candidate = `/content/video/${topicId}/video.mp4`;
  // external placeholder (small, public domain)
  const externalPlaceholder = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const defaultPoster = 'https://via.placeholder.com/960x540.png?text=Video+Placeholder';
  const [videoSrc, setVideoSrc] = useState<string>(candidate);

  useEffect(() => {
    let mounted = true;
    // check if candidate exists (HEAD); fall back to external placeholder
    fetch(candidate, { method: 'HEAD' })
      .then((res) => {
        if (!mounted) return;
        if (res.ok) setVideoSrc(candidate);
        else setVideoSrc(externalPlaceholder);
      })
      .catch(() => {
        if (!mounted) return;
        setVideoSrc(externalPlaceholder);
      });
    return () => { mounted = false; };
  }, [candidate]);

  return (
    <div className="readingRoot videoRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>
        ← Kembali
      </button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">Video: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Video pembelajaran</p>
          </div>

          <article className="readingCard">
            <div className="videoPlayerWrap">
              <video className="videoPlayer" controls preload="metadata" poster={defaultPoster}>
                <source src={videoSrc} type="video/mp4" />
                Browser Anda tidak mendukung tag video.
              </video>
            </div>

            <h2>Deskripsi</h2>
            <p>
              Video ini adalah template pemutar video untuk topik <strong>{topicId}</strong>. Ganti
              sumber video pada path <code>{videoSrc}</code> dengan file MP4 yang sesuai.
            </p>

            <div className="readingActions">
              <button className="primary">Mulai Kuis</button>
              <button>Daftar Isi</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Video;
