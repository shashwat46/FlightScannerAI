import React from 'react';
import styles from './styles.module.css';

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  stops?: number[];
  labels?: [string, string, string];
  compact?: boolean;
}

export default function Gauge({ value, min = 0, max = 1, stops = [0.33, 0.66], compact = false }: GaugeProps) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min))) * 100;
  return (
    <div className={`${styles.gauge} ${compact ? styles['gauge--compact'] : ''}`} aria-label="gauge">
      <div className={styles.gauge__track} />
      <div className={styles.gauge__zones}>
        <span className={styles['gauge__zone--low']} style={{ width: `${stops[0] * 100}%` }} />
        <span className={styles['gauge__zone--mid']} style={{ width: `${(stops[1] - stops[0]) * 100}%` }} />
        <span className={styles['gauge__zone--high']} style={{ width: `${(1 - stops[1]) * 100}%` }} />
      </div>
      <div className={`${styles.gauge__thumb} ${compact ? styles['gauge__thumb--compact'] : ''}`} style={{ left: `calc(${pct}% - ${compact ? '6px' : '8px'})` }} />
    </div>
  );
}


