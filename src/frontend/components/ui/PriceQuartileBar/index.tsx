"use client";
import React from 'react';
import styles from './styles.module.css';

interface Props {
  from: string;
  to: string | undefined;
  depart?: string;
  currency?: string;
  currentPrice: number;
  oneWay?: boolean;
  quartiles?: [number, number, number, number, number];
}

export default function PriceQuartileBar({ from, to, depart, currency = 'USD', currentPrice, oneWay, quartiles: quartilesProp }: Props) {
  const [quartiles, setQuartiles] = React.useState<[number, number, number, number, number] | null>(quartilesProp || null);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      if (!from || !to || !depart) return;
      if (Array.isArray(quartilesProp) && quartilesProp.length === 5) {
        setQuartiles(quartilesProp);
        return;
      }
      const url = new URL('/api/price-metrics', window.location.origin);
      url.searchParams.set('originIataCode', from);
      url.searchParams.set('destinationIataCode', to!);
      url.searchParams.set('departureDate', depart);
      if (currency) url.searchParams.set('currencyCode', currency);
      if (typeof oneWay === 'boolean') url.searchParams.set('oneWay', String(oneWay));
      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const metrics = Array.isArray(data?.priceMetrics) ? data.priceMetrics : [];
      const q = metrics.map((m: any) => Number(m?.amount || 0));
      if (!ignore && q.length >= 5) setQuartiles([q[0], q[1], q[2], q[3], q[4]]);
    }
    load();
    return () => { ignore = true; };
  }, [from, to, depart, currency, oneWay, JSON.stringify(quartilesProp)]);

  if (!to || !depart) return null;

  const min = quartiles?.[0];
  const q1 = quartiles?.[1];
  const q2 = quartiles?.[2];
  const q3 = quartiles?.[3];
  const max = quartiles?.[4];

  // Fallback logic when no quartiles data
  if (!quartiles) {
    const fallbackMin = currentPrice * 0.7;
    const fallbackMax = currentPrice * 1.5;
    const fallbackRange = fallbackMax - fallbackMin;
    const fallbackPct = (currentPrice - fallbackMin) / fallbackRange;
    
    return (
      <div>
        <div className={styles.barContainer}>
          <div className={styles.bar}>
            <span className={styles.zoneLow} style={{ width: '25%' }} />
            <span className={styles.zoneMid} style={{ width: '50%' }} />
            <span className={styles.zoneHigh} style={{ width: '25%' }} />
            <span className={styles.thumb} style={{ left: `calc(${Math.max(0, Math.min(1, fallbackPct)) * 100}% - 8px)` }} />
          </div>
        </div>
        <div className={styles.labels}>
          <span>Price analysis loading...</span>
        </div>
      </div>
    );
  }

  // Use exact min–max range from Amadeus quartiles
  const range = max && min && max > min ? max - min : undefined;

  const clamp = (v: number) => {
    if (!range || min === undefined) return 0.5;
    return Math.max(0, Math.min(1, (v - min) / range));
  };

  // Calculate positions relative to min/max range  
  const currentPct = clamp(currentPrice);
  let q1Pct = clamp(q1 ?? min ?? 0);
  let q3Pct = clamp(q3 ?? max ?? 1);

  // Ensure visible green zone if there is a difference between min and q1
  if (q1 && min && q1 > min && q1Pct < 0.1) {
    q1Pct = 0.2; // Minimum 20% for green
    q3Pct = Math.min(1, q3Pct + (0.2 - q1Pct)); // Adjust Q3 accordingly
  }

  // Google Flights style: Green (0 to Q1), Yellow (Q1 to Q3), Red (Q3 to 100%)
  const gradient = `linear-gradient(to right, #22c55e 0%, #22c55e ${q1Pct * 100}%, #f59e0b ${q1Pct * 100}%, #f59e0b ${q3Pct * 100}%, #ef4444 ${q3Pct * 100}%, #ef4444 100%)`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.barContainer}>
        <div className={styles.bar} style={{ background: gradient }}>
          {/* Current price thumb */}
          <span className={styles.thumb} style={{ left: `calc(${Math.max(0, Math.min(1, currentPct)) * 100}% - 8px)` }} />
          
          {/* Q1 marker */}
          <span className={styles.quartileMarker} style={{ left: `calc(${q1Pct * 100}% - 1px)` }} />
          
          {/* Q3 marker */}
          <span className={styles.quartileMarker} style={{ left: `calc(${q3Pct * 100}% - 1px)` }} />
        </div>
      </div>
      
      {/* Current price label */}
      <div className={styles.marker} style={{ left: `calc(${Math.max(0, Math.min(1, currentPct)) * 100}% - 24px)` }}>
        <div className={styles.markerLabel}>{formatCurrency(currentPrice, currency)}</div>
        <div className={styles.markerArrow} />
      </div>
      
      {/* Q1 and Q3 labels */}
      <div className={styles.quartileLabels}>
        <div className={styles.quartileLabel} style={{ left: `calc(${q1Pct * 100}% - 30px)` }}>
          {formatCurrency(q1 ?? 0, currency)}
        </div>
        <div className={styles.quartileLabel} style={{ left: `calc(${q3Pct * 100}% - 30px)` }}>
          {formatCurrency(q3 ?? 0, currency)}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency || '$'}${Math.round(amount)}`;
  }
}


