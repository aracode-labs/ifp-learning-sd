import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useSubjectContent } from '@/hooks/useData';
import styles from './TopicIntro.module.css';
import CharacterAnimator from '@/components/CharacterAnimator/CharacterAnimator';

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

  // (topicNum/subjectName removed — not used here)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Kembali
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.twoCol}>
          <div className={styles.left}>
            {(() => {
              return (
                <div className={styles.character}>
                  <CharacterAnimator
                    animation={topicData?.characterFolder || 'karakter_idle'}
                    fps={12}
                    autoplay={true}
                    autoSize={true}
                    scale={'80%'}
                    align="left"
                    alignOffset={8}
                  />
                </div>
              );
            })()}
          </div>

          <div className={styles.right}>
            <div className={styles.board}>
              <div className={styles.contentBox}>
                <h1 className={styles.title}>{topicData.title}</h1>
                <p className={styles.subtitle}>Bab {topicData.chapter}</p>
                <p className={styles.lead}>{topicData.description}</p>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.icon}>📚</div>
                <div className={styles.text}>Informasi materi</div>
              </div>

              <div className={styles.boardButton} onClick={handleContinue} role="button">
                Lanjut
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
      </div>
    </div>
  );
};

export default TopicIntro;
