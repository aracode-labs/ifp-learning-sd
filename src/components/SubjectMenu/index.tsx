import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useData } from '@/hooks/useData';
import styles from './SubjectMenu.module.css';

interface Subject {
  id: string;
  name: string;
  icon: string;
}

const SubjectMenu: React.FC = () => {
  const navigate = useNavigate();
  const { selectedGrade, setSelectedSubject } = useAppContext();
  const { data: subjectsData, loading, error } = useData('/subjects-by-class.json');

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!subjectsData) return <div className={styles.container}>No data</div>;

  const classData = (subjectsData?.classes || []).find((c: any) => c.kelas === selectedGrade);
  const subjects = classData?.subjects || [];

  const handleSelectSubject = (subjectCode: string) => {
    setSelectedSubject(subjectCode);
    navigate(`/topics/${subjectCode}`);
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectMenu;
