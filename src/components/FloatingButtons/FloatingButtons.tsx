'use client';
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import styles from './FloatingButtons.module.css';

export default function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.floatContainer}>
      <div className={styles.backTopBtn} onClick={scrollToTop}>
        <ChevronUp size={18} />
      </div>
    </div>
  );
}
