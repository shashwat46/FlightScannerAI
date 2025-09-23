'use client';
import React, { useState } from 'react';
import styles from './styles.module.css';
import { X } from 'lucide-react';

interface Props {
  origin: string;
  destination: string;
  onClose: () => void;
}

export default function WishlistModal({ origin, destination, onClose }: Props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxPrice, setMaxPrice] = useState(500);
  const [startDateType, setStartDateType] = useState('text');
  const [endDateType, setEndDateType] = useState('text');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // YYYY-MM-DD
    const payload = {
      origin,
      destination,
      start_date: startDate || null,
      end_date: endDate || null,
      max_price: maxPrice,
    };

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to set price alert');
      // TODO: Show success notification
    } catch (error) {
      console.error(error);
      // TODO: Show error notification
    } finally {
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
        <div className={styles.header}>
          <h2>Watch Flight Prices</h2>
          <p>
            Track prices for flights from <strong>{origin}</strong> to <strong>{destination}</strong>.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.dateRange}>
            <div className={styles.formGroup}>
              <label htmlFor="start-date">Start Date</label>
              <input
                type={startDateType}
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onFocus={() => setStartDateType('date')}
                onBlur={() => !startDate && setStartDateType('text')}
                placeholder="dd / mm / yyyy"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="end-date">End Date</label>
              <input
                type={endDateType}
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onFocus={() => setEndDateType('date')}
                onBlur={() => !endDate && setEndDateType('text')}
                placeholder="dd / mm / yyyy"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="max-price">Budget</label>
            <div className={styles.budgetInputContainer}>
              <span className={styles.currencySymbol}>$</span>
              <input
                type="number"
                id="max-price"
                min="0"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={`${styles.input} ${styles.budgetInput}`}
                placeholder="500"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Set Price Alert
          </button>
        </form>
      </div>
    </div>
  );
}
