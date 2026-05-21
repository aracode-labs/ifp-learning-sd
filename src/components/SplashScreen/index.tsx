import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashScreen.module.css';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/greeting');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>📚 IFP Learning SD</h1>
        <p className={styles.subtitle}>Platform Pembelajaran Interaktif</p>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
