import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import styles from './ClassSelector.module.css';

const ClassSelector: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedGrade, setSemester } = useAppContext();
  const [selectedGrade, setGrade] = useState<number | null>(null);
  const [selectedSemester, setSem] = useState<number | null>(null);

  const handleContinue = () => {
    if (selectedGrade && selectedSemester) {
      setSelectedGrade(selectedGrade);
      setSemester(selectedSemester);
      navigate('/subjects');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button className={styles.backButton} onClick={() => navigate('/greeting')}>
          ← Kembali
        </button>

        <h1 className={styles.title}>Pilih Kelas & Semester</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Kelas</h2>
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                className={`${styles.gradeButton} ${selectedGrade === grade ? styles.active : ''}`}
                onClick={() => setGrade(grade)}
              >
                <span className={styles.gradeNumber}>{grade}</span>
                <span className={styles.gradeLabel}>Kelas {grade}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Semester</h2>
          <div className={styles.semesterGroup}>
            {[1, 2].map((sem) => (
              <button
                key={sem}
                className={`${styles.semesterButton} ${selectedSemester === sem ? styles.active : ''}`}
                onClick={() => setSem(sem)}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        <button
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={!selectedGrade || !selectedSemester}
        >
          Lanjutkan →
        </button>
      </div>
    </div>
  );
};

export default ClassSelector;
