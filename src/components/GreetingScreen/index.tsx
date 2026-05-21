import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GreetingScreen.module.css';

const GreetingScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/class-selector');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Selamat Datang! 👋</h1>
          <p className={styles.subtitle}>di Platform Pembelajaran IFP Learning SD</p>
        </div>

        <div className={styles.content}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📚</span>
            <h3>Pelajaran Lengkap</h3>
            <p>Materi dari Kelas 1 hingga 6 untuk semua mata pelajaran</p>
          </div>

          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎮</span>
            <h3>Interaktif & Menyenangkan</h3>
            <p>Video, 3D model, kuis, dan games yang edukatif</p>
          </div>

          <div className={styles.feature}>
            <span className={styles.featureIcon}>⭐</span>
            <h3>Pembelajaran Personal</h3>
            <p>Pilih kelas, semester, dan topik sesuai kebutuhanmu</p>
          </div>
        </div>

        <button className={styles.button} onClick={handleStart}>
          Mulai Belajar →
        </button>
      </div>
    </div>
  );
};

export default GreetingScreen;
