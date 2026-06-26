import React, { useEffect, useMemo, useState } from 'react';
import { preloadFrames, FrameSource } from '@/utils/frameLoader';
import styles from './SlideShow.module.css';

type Props = {
  slides?: string[] | FrameSource;
  currentCueIndex: number;
  onReady?: () => void;
};

const animationVariants = ['slideMoveA', 'slideMoveB', 'slideMoveC', 'slideMoveD'] as const;
type SlideAnimationVariant = typeof animationVariants[number];

const SlideShow: React.FC<Props> = ({ slides, currentCueIndex, onReady }) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [animationClass, setAnimationClass] = useState<SlideAnimationVariant>('slideMoveA');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentIndex = useMemo(() => {
    if (!images.length) return 0;
    return Math.min(Math.max(0, currentCueIndex), images.length - 1);
  }, [currentCueIndex, images.length]);

  useEffect(() => {
    if (!slides) {
      setImages([]);
      setLoaded(false);
      return;
    }

    let mounted = true;
    preloadFrames(slides, () => {})
      .then((imgs) => {
        if (!mounted) return;
        setImages(imgs);
        setLoaded(true);
        onReady?.();
      })
      .catch(() => {
        if (!mounted) return;
        setImages([]);
        setLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [slides, onReady]);

  useEffect(() => {
    if (!loaded || !images.length) return;
    if (currentIndex === visibleIndex) return;

    setPreviousIndex(visibleIndex);
    setVisibleIndex(currentIndex);
    setAnimationClass((prev) => {
      const next = animationVariants[Math.floor(Math.random() * animationVariants.length)];
      return next === prev ? animationVariants[(animationVariants.indexOf(prev) + 1) % animationVariants.length] : next;
    });
    setIsTransitioning(true);
    const timer = window.setTimeout(() => {
      setPreviousIndex(null);
      setIsTransitioning(false);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentIndex, images.length, loaded, visibleIndex]);

  const currentImage = images[visibleIndex];
  const previousImage = previousIndex !== null ? images[previousIndex] : undefined;

  if (!slides) return null;

  return (
    <div className={styles.slideShow}>
      {loaded && currentImage ? (
        <>
          {previousImage && (
            <img
              key={`prev-${previousIndex}`}
              className={`${styles.slideImage} ${styles.slideImagePrevious}`}
              src={previousImage.src}
              alt={`Previous slide ${previousIndex !== null ? previousIndex + 1 : 0}`}
            />
          )}
          <img
            key={`current-${visibleIndex}`}
            className={`${styles.slideImage} ${styles.slideImageCurrent} ${styles[animationClass]}`}
            src={currentImage.src}
            alt={`Slide ${visibleIndex + 1}`}
          />
        </>
      ) : (
        <div className={styles.placeholder}>Memuat slide...</div>
      )}
    </div>
  );
};

export default SlideShow;
