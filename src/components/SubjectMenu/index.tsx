import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useSubjects } from '@/hooks/useData';
import styles from './SubjectMenu.module.css';

interface Subject {
  id: string;
  name: string;
  icon: string;
  grades: number[];
  description: string;
}

const SubjectMenu: React.FC = () => {
  const navigate = useNavigate();
  const { selectedGrade, setSelectedSubject } = useAppContext();
  const { data: subjectsData, loading, error } = useSubjects();

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;

  const subjects = (subjectsData?.subjects || []).filter(
    (s: Subject) => selectedGrade && s.grades.includes(selectedGrade)
  );

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId);
    navigate(`/topics/${subjectId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/class-selector')}>
          ← Kembali
        </button>
        <h1 className={styles.title}>Pilih Pelajaran</h1>
        <p className={styles.subtitle}>Kelas {selectedGrade}</p>
      </div>

      <div className={styles.grid}>
        {subjects.map((subject: Subject) => (
          <button
            key={subject.id}
            className={styles.card}
            onClick={() => handleSelectSubject(subject.id)}
          >
            <div className={styles.icon}>{subject.icon}</div>
            <h3 className={styles.name}>{subject.name}</h3>
            <p className={styles.description}>{subject.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectMenu;
