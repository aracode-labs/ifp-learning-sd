import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useSubjectContent } from '@/hooks/useData';
import styles from './TopicIntro.module.css';

const TopicIntro: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { selectedGrade, selectedSemester, selectedSubject } = useAppContext();
  const { data: subjectDetail, loading } = useSubjectContent(
    selectedGrade,
    selectedSemester,
    selectedSubject || null
  );

  const [topicData, setTopicData] = useState<any>(null);

  useEffect(() => {
    if (subjectDetail?.materials) {
      const topic = subjectDetail.materials.find((m: any) => m.id === topicId);
      setTopicData(topic);
    }
  }, [subjectDetail, topicId]);

  const handleContinue = () => {
    navigate(`/content-selector/${topicId}`);
  };

  if (loading || !topicData) {
    return <div className={styles.container}>Loading...</div>;
  }

  // Extract topic number from topicId (e.g., '1' from 'matematika-1')
  const topicNum = topicId?.split('-').pop() || '1';
  const subjectName = selectedSubject?.split('-').shift() || 'topik';
  const videoPath = `/content/kelas${selectedGrade}-semester${selectedSemester}/${subjectName}/topik-${topicNum}/intro/intro-topik.mp4`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Kembali
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{topicData.title}</h1>
        <p className={styles.subtitle}>Bab {topicData.chapter}</p>

        <div className={styles.videoContainer}>
          <div className={styles.videoPlaceholder}>
            <div className={styles.playButton}>▶</div>
            <p className={styles.placeholderText}>Video Intro Topik</p>
            <video
              className={styles.video}
              controls
              controlsList="nodownload"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'%3E%3Crect fill='%23f0f0f0'/%3E%3C/svg%3E"
            >
              <source src={videoPath} type="video/mp4" />
              Browser Anda tidak mendukung video.
            </video>
          </div>
        </div>

        <div className={styles.description}>
          <h2>Deskripsi</h2>
          <p>{topicData.description}</p>
          <div className={styles.meta}>
            <span className={styles.duration}>⏱ {topicData.duration_minutes} menit</span>
          </div>
        </div>

        <button className={styles.continueButton} onClick={handleContinue}>
          Lanjut ke Pilihan Konten
        </button>
      </div>
    </div>
  );
};

export default TopicIntro;
