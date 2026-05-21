import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import styles from './ClassSelector.module.css';

const subjects = [
  { id: 'ipa', name: 'IPA', icon: '🔬' },
  { id: 'matematika', name: 'Matematika', icon: '🔢' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: '📖' },
  { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: '🌐' },
  { id: 'ips', name: 'IPS', icon: '🌍' },
  { id: 'seni', name: 'Seni', icon: '🎨' },
  { id: 'penjas', name: 'Penjas', icon: '⚽' },
  { id: 'pkn', name: 'PKN', icon: '🇮🇩' },
  { id: 'agama', name: 'Agama', icon: '🙏' },
];

const gradeColors = ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFC966', '#FFD700'];
const gradeEmojis = ['🐣', '🐥', '🐦', '🦅', '🦉', '🦚'];

const ClassSelector: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedGrade, setSemester, setSelectedSubject } = useAppContext();
  const [selectedGrade, setGrade] = useState<number | null>(null);
  const [selectedSemester, setSem] = useState<number | null>(null);

  const handleSelectClass = (grade: number) => {
    setGrade(grade);
  };

  const handleSelectSemester = (sem: number) => {
    setSem(sem);
  };

  const handleSelectSubject = (subjectId: string) => {
    if (selectedGrade && selectedSemester) {
      setSelectedGrade(selectedGrade);
      setSemester(selectedSemester);
      setSelectedSubject(subjectId);
      navigate('/topics');
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/greeting')}>
        ← Kembali
      </button>

      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>Pilih Kelas Anda</h1>
      </div>

      {selectedGrade && selectedSemester ? (
        // View: Kelas & Semester sudah dipilih, tampilkan grid pelajaran
        <div className={styles.classThumbnail}>
          <div className={styles.classHeader}>
            <div className={styles.classInfo}>
              <h2 className={styles.classTitle}>Kelas {selectedGrade}</h2>
              <p className={styles.semesterText}>Semester {selectedSemester}</p>
            </div>
            <button 
              className={styles.changeClassButton}
              onClick={() => {
                setGrade(null);
                setSem(null);
              }}
            >
              ✏️ Ubah
            </button>
          </div>

          <div className={styles.subjectsGrid}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                className={styles.subjectCard}
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div className={styles.subjectIcon}>{subject.icon}</div>
                <p className={styles.subjectName}>{subject.name}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // View: Pilih kelas dan semester
        <div className={styles.selectionSection}>
          <div className={styles.gradesContainer}>
            <h2 className={styles.sectionTitle}>Pilih Kelas</h2>
            <div className={styles.gradesGrid}>
              {[1, 2, 3, 4, 5, 6].map((grade, idx) => (
                <button
                  key={grade}
                  className={`${styles.gradeCard} ${selectedGrade === grade ? styles.activeGrade : ''}`}
                  onClick={() => handleSelectClass(grade)}
                  style={{
                    borderColor: selectedGrade === grade ? gradeColors[idx] : '#ddd',
                    backgroundColor: selectedGrade === grade ? `${gradeColors[idx]}15` : 'white',
                  }}
                >
                  <div className={styles.gradeEmoji}>{gradeEmojis[idx]}</div>
                  <div className={styles.gradeName}>Kelas {grade}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedGrade && (
            <div className={styles.semesterContainer}>
              <h2 className={styles.sectionTitle}>Pilih Semester</h2>
              <div className={styles.semesterGrid}>
                {[1, 2].map((sem) => (
                  <button
                    key={sem}
                    className={`${styles.semesterCard} ${selectedSemester === sem ? styles.activeSemester : ''}`}
                    onClick={() => handleSelectSemester(sem)}
                  >
                    <div className={styles.semesterNumber}>Semester {sem}</div>
                    {sem === 1 && <div className={styles.semesterRange}>Juli - Desember</div>}
                    {sem === 2 && <div className={styles.semesterRange}>Januari - Juni</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
