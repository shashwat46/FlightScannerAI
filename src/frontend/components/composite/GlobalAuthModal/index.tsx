'use client';
import React, { useEffect } from 'react';
import { useAuthModal } from '@/src/frontend/contexts/AuthModalContext';
import LoginModal from '../LoginModal';
import styles from './styles.module.css';

export default function GlobalAuthModal() {
  const { isModalOpen, closeModal } = useAuthModal();

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="Close modal"
          type="button"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <LoginModal />
      </div>
    </div>
  );
}
