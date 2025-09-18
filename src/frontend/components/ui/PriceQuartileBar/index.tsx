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
}

export default function PriceQuartileBar({ from, to, depart, currency = 'USD', currentPrice, oneWay }: Props) {
  const [quartiles, setQuartiles] = React.useState<[number, number, number, number, number] | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      if (!from || !to || !depart) return;
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
  }, [from, to, depart, currency, oneWay]);

  if (!to || !depart) return null;

  const min = quartiles?.[0];
  const q1 = quartiles?.[1];
  const q2 = quartiles?.[2];
  const q3 = quartiles?.[3];
  const max = quartiles?.[4];

  const range = max && min && max > min ? max - min : undefined;
  const clamp = (v: number) => {
    if (!range || !min) return 0;
    return Math.max(0, Math.min(1, (v - min) / range));
  };

  const currentPct = clamp(currentPrice);
  const q1Pct = clamp(q1 || 0);
  const q2Pct = clamp(q2 || 0);
  const q3Pct = clamp(q3 || 0);

  return (
    <div>
      <div className={styles.bar}>
        <span className={styles.zoneLow} style={{ width: `${(q1Pct || 0) * 100}%` }} />
        <span className={styles.zoneMid} style={{ width: `${((q3Pct || 1) - (q1Pct || 0)) * 100}%` }} />
        <span className={styles.zoneHigh} style={{ width: `${(1 - (q3Pct || 1)) * 100}%` }} />
        <span className={styles.thumb} style={{ left: `calc(${currentPct * 100}% - 6px)` }} />
      </div>
      {quartiles && (
        <div className={styles.labels}>
          <span>Min {currency} {round(min)}</span>
          <span>Median {currency} {round(q2)}</span>
          <span>Max {currency} {round(max)}</span>
        </div>
      )}
    </div>
  );
}

function round(n?: number | null) {
  if (typeof n !== 'number' || !isFinite(n)) return '-';
  return Math.round(n);
}


