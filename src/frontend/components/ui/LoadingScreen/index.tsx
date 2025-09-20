'use client';
import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './styles.module.css';

interface LoadingScreenProps {
  isVisible: boolean;
}

const loadingTexts = [
  "Finding steal deals...",
  "Scanning flight prices...",
  "Analyzing routes...",
  "Comparing airlines...",
  "Almost there..."
];

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const textInterval = setInterval(() => {
      setIsTextVisible(false);
      
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
        setIsTextVisible(true);
      }, 300); // Half second fade out before changing text
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(textInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.animation}>
          <DotLottieReact
            src="https://lottie.host/b3b40beb-6fda-44f6-a847-b77bf49c82b1/8RpGNgETOZ.lottie"
            loop
            autoplay
            style={{ width: '100vw', height: '100vh' }}
          />
        </div>
        <div 
          className={`${styles.text} ${isTextVisible ? styles.textVisible : styles.textHidden}`}
        >
          {loadingTexts[currentTextIndex]}
        </div>
      </div>
    </div>
  );
}
