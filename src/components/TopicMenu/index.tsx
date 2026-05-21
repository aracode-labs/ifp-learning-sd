import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useSubjectContent } from '@/hooks/useData';
import styles from './TopicMenu.module.css';

const TopicMenu: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();
  const { selectedGrade, selectedSemester, setSelectedTopic } = useAppContext();
  const { data: subjectDetail, loading, error } = useSubjectContent(
    selectedGrade,
    selectedSemester,
    subjectId || null
  );

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!subjectDetail) return <div className={styles.container}>No data found</div>;

  const materials = subjectDetail?.materials || [];

  const handleSelectTopic = (materialId: string) => {
    setSelectedTopic(materialId);
    navigate(`/topic-intro/${materialId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/subjects')}>
          ← Kembali
        </button>
        <h1 className={styles.title}>Pilih Topik</h1>
        <p className={styles.subtitle}>{subjectDetail?.subject} - Kelas {selectedGrade}</p>
      </div>

      <div className={styles.list}>
        {materials.map((material: any) => (
          <div
            key={material.id}
            className={styles.item}
            onClick={() => handleSelectTopic(material.id)}
          >
            <div className={styles.cardContent}>
              <h3 className={styles.itemTitle}>{material.title}</h3>
              <p className={styles.itemDescription}>{material.description}</p>
              <div className={styles.meta}>
                <span className={styles.chapter}>Bab {material.chapter}</span>
                <span className={styles.duration}>⏱ {material.duration_minutes} menit</span>
              </div>
              <button className={styles.viewButton}>Lihat Materi</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicMenu;
