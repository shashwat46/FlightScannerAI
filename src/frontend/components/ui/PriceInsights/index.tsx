"use client";
import React from 'react';
import PriceQuartileBar from '../PriceQuartileBar';
import styles from './styles.module.css';

interface Props {
  from: string;
  to?: string;
  depart?: string;
  currency?: string;
  currentPrice: number;
  oneWay?: boolean;
  priceHistory?: { current?: number; low?: number; high?: number; quartiles?: number[]; };
}

export default function PriceInsights({ from, to, depart, currency = 'USD', currentPrice, oneWay, priceHistory }: Props) {
  const [quartiles, setQuartiles] = React.useState<[number, number, number, number, number] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // If we have priceHistory with real quartiles, use them immediately
    if (priceHistory && Array.isArray(priceHistory.quartiles) && priceHistory.quartiles.length >= 5) {
      const q = priceHistory.quartiles;
      setQuartiles([q[0], q[1], q[2], q[3], q[4]]);
    }
    setLoading(false);
  }, [priceHistory]);

  if (!to || !depart) return null;

  const status = computePriceStatus(currentPrice, quartiles);
  const destination = to === 'DEL' ? 'New Delhi' : to;

  return (
    <div className={styles.insights}>
      {quartiles ? (
        <>
          <div className={styles.header}>
            <div className={styles.statusLine}>
              <span className={styles.statusText}>Prices are currently </span>
              <span className={`${styles.statusBadge} ${styles[status.level]}`}>
                {status.level}
              </span>
              <span className={styles.statusText}> for your search</span>
            </div>
            
            {status.badge && (
              <div className={`${styles.priceBadge} ${styles[status.level]}`}>
                {formatCurrency(currentPrice, currency)} is {status.level}
              </div>
            )}
          </div>

          
          <div className={styles.quartileSection}>
            <PriceQuartileBar 
              from={from} 
              to={to} 
              depart={depart} 
              currency={currency} 
              currentPrice={currentPrice} 
              oneWay={oneWay} 
              quartiles={quartiles} 
            />
          </div>
        </>
      ) : (
        <div className={styles.errorState}>
          Could not get historical price data
        </div>
      )}
    </div>
  );
}

interface PriceStatus {
  level: 'low' | 'typical' | 'high';
  badge: boolean;
}

function computePriceStatus(current: number, quartiles: [number, number, number, number, number] | null): PriceStatus {
  if (!quartiles) return { level: 'typical', badge: false };
  
  const [min, q1, median, q3, max] = quartiles;
  
  if (current < q1) return { level: 'low', badge: true };
  if (current > q3) return { level: 'high', badge: true };
  return { level: 'typical', badge: false };
}

function formatCurrency(amount: number, currency?: string): string {
  try {
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency: currency || 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  } catch {
    return `${currency || 'USD'} ${Math.round(amount)}`;
  }
}


