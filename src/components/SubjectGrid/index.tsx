import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import styles from './SubjectGrid.module.css';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ClassGroup {
  kelas: number;
  semester: number;
  subjects: Subject[];
}

const subjects: Subject[] = [
  { id: 'ipa', name: 'IPA', icon: '🔬', color: '#FF6B6B' },
  { id: 'matematika', name: 'Matematika', icon: '🔢', color: '#4ECDC4' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: '📖', color: '#FFE66D' },
  { id: 'bahasa-inggris', name: 'Bahasa Inggris', icon: '🌐', color: '#95E1D3' },
  { id: 'ips', name: 'IPS', icon: '🌍', color: '#A8D8EA' },
  { id: 'seni', name: 'Seni', icon: '🎨', color: '#F7DC6F' },
  { id: 'penjas', name: 'Penjas', icon: '⚽', color: '#85C1E9' },
  { id: 'pkn', name: 'PKN', icon: '🇮🇩', color: '#F5B041' },
  { id: 'agama', name: 'Agama', icon: '🙏', color: '#BB8FCE' },
];

const gradeEmojis = ['🐣', '🐥', '🐦', '🦅', '🦉', '🦚'];

const SubjectGrid: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedGrade, setSemester, setSelectedSubject } = useAppContext();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Generate class groups (6 kelas × 2 semester)
  const classGroups: ClassGroup[] = [];
  for (let kelas = 1; kelas <= 6; kelas++) {
    for (let semester = 1; semester <= 2; semester++) {
      classGroups.push({
        kelas,
        semester,
        subjects,
      });
    }
  }

  const handleSelectSubject = (subject: Subject, kelas: number, semester: number) => {
    setSelectedGrade(kelas);
    setSemester(semester);
    setSelectedSubject(subject.id);
    navigate(`/topics/${subject.id}`);
  };

  const filteredGroups = selectedClass
    ? classGroups.filter((g) => selectedClass === `${g.kelas}-${g.semester}`)
    : classGroups;

  return (
    <div className={styles.container}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterContent}>
          <h1 className={styles.title}>📚 Pilih Pelajaran</h1>
          <div className={styles.classFilter}>
            <button
              className={`${styles.filterBtn} ${!selectedClass ? styles.activeFilter : ''}`}
              onClick={() => setSelectedClass(null)}
            >
              Semua Pelajaran
            </button>
            {classGroups.map((group) => (
              <button
                key={`${group.kelas}-${group.semester}`}
                className={`${styles.filterBtn} ${
                  selectedClass === `${group.kelas}-${group.semester}` ? styles.activeFilter : ''
                }`}
                onClick={() => setSelectedClass(`${group.kelas}-${group.semester}`)}
              >
                {gradeEmojis[group.kelas - 1]} Kelas {group.kelas}-{group.semester}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredGroups.map((group) => (
          <div key={`${group.kelas}-${group.semester}`} className={styles.classSection}>
            <div className={styles.classHeader}>
              <span className={styles.emoji}>{gradeEmojis[group.kelas - 1]}</span>
              <h2 className={styles.className}>
                Kelas {group.kelas} - Semester {group.semester}
              </h2>
            </div>

            <div className={styles.subjectsGrid}>
              {group.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={styles.subjectCard}
                  onClick={() => handleSelectSubject(subject, group.kelas, group.semester)}
                >
                  <div
                    className={styles.cardImage}
                    style={{
                      backgroundImage: `url(/content/kelas${group.kelas}-semester${group.semester}/${subject.id}/thumbnail/thumbnail.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className={styles.cardContent}>
                    <h3 className={styles.subjectName}>{subject.name}</h3>
                    <p className={styles.subjectMeta}>
                      Kelas {group.kelas} • Semester {group.semester}
                    </p>
                    <button className={styles.viewButton}>Lihat Topik</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectGrid;
