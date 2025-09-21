'use client';
import React from 'react';
import FilterBar from '../FilterBar';
import styles from './styles.module.css';

export default function ResultsHeader() {
  return (
    <section className={styles.heroSection}>
      <div className="container">
        <div className={styles.brandSection}>
          <img 
            src="/logo.svg" 
            alt="Wingman AI" 
            className={styles.logo}
          />
          <h1 className={styles.title}>Wingman AI</h1>
        </div>

        <div className={styles.filterSection}>
          <FilterBar />
        </div>
      </div>
    </section>
  );
}
