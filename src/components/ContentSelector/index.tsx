import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ContentSelector.module.css';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const ContentSelector: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();

  const contentTypes: ContentType[] = [
    {
      id: 'reading',
      name: 'Membaca',
      icon: '📖',
      description: 'Baca materi pembelajaran',
      color: '#FF6B6B',
    },
    {
      id: 'interactive',
      name: 'Interaktif',
      icon: '🎮',
      description: 'Konten interaktif dan animasi',
      color: '#4ECDC4',
    },
    {
      id: 'video',
      name: 'Video',
      icon: '🎥',
      description: 'Tonton video pembelajaran',
      color: '#FFD93D',
    },
    {
      id: '3d',
      name: '3D Model',
      icon: '🌐',
      description: 'Eksplorasi model 3D',
      color: '#6BCB77',
    },
    {
      id: 'quiz',
      name: 'Kuis & Games',
      icon: '🎯',
      description: 'Uji pemahaman dengan kuis',
      color: '#9D84B7',
    },
    {
      id: 'evaluation',
      name: 'Evaluasi',
      icon: '📊',
      description: 'Tes evaluasi pembelajaran',
      color: '#FF8C42',
    },
  ];

  const handleSelectContent = (contentId: string) => {
    // Navigate to content viewer
    navigate(`/content/${contentId}/${topicId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Kembali
        </button>
        <h1 className={styles.title}>Pilih Jenis Konten</h1>
        <p className={styles.subtitle}>Topik #{topicId}</p>
      </div>

      <div className={styles.grid}>
        {contentTypes.map((content) => (
          <button
            key={content.id}
            className={styles.card}
            onClick={() => handleSelectContent(content.id)}
            style={{ borderTopColor: content.color }}
          >
            <div className={styles.icon}>{content.icon}</div>
            <h3 className={styles.name}>{content.name}</h3>
            <p className={styles.description}>{content.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContentSelector;
