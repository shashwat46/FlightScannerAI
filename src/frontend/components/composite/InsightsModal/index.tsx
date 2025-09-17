"use client";
import React from 'react';
import styles from './styles.module.css';

interface Props {
  aiDealScore?: number;
  insights?: { positives: string[]; warnings: string[] };
  onClose?: () => void;
}

export default function InsightsModal({ aiDealScore, insights, onClose }: Props) {
  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.modal__content}>
        <header className={styles.modal__header}>
          <strong>{typeof aiDealScore === 'number' ? `${aiDealScore}%` : ''} AI deal insights</strong>
          <button onClick={onClose} aria-label="Close" className={styles.modal__close}>×</button>
        </header>
        <div className={styles.modal__body}>
          <div>
            <div className={styles.modal__title}>Positives</div>
            <ul>
              {insights?.positives?.map((p, i) => (
                <li key={`p-${i}`}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className={styles.modal__title}>Warnings</div>
            <ul>
              {insights?.warnings?.map((w, i) => (
                <li key={`w-${i}`}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


