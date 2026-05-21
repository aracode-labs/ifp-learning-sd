import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useSubjectContent } from '@/hooks/useData';
import styles from './TopicMenu.module.css';

const TopicMenu: React.FC = () => {
  const navigate = useNavigate();
  const { subjectCode } = useParams<{ subjectCode: string }>();
  const { selectedGrade, selectedSemester, setSelectedTopic } = useAppContext();
  const { data: subjectDetail, loading, error } = useSubjectContent(
    selectedGrade,
    selectedSemester,
    subjectCode || null
  );

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!subjectDetail) return <div className={styles.container}>No data found</div>;

  const materials = subjectDetail?.materials || [];

  const handleSelectTopic = (materialId: string) => {
    setSelectedTopic(materialId);
    navigate(`/content-selector/${materialId}`);
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
          <button
            key={material.id}
            className={styles.item}
            onClick={() => handleSelectTopic(material.id)}
          >
            <div className={styles.content}>
              <h3 className={styles.itemTitle}>{material.title}</h3>
              <p className={styles.itemDescription}>{material.description}</p>
              <div className={styles.meta}>
                <span className={styles.chapter}>Bab {material.chapter}</span>
                <span className={styles.duration}>⏱ {material.duration_minutes} menit</span>
                <span className={styles.difficulty}>📊 {material.difficulty}</span>
              </div>
            </div>
            <div className={styles.arrow}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicMenu;
