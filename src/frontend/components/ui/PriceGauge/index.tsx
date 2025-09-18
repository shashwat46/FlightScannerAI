import React from 'react';
import Gauge from '../Gauge';

export interface QuartileMetrics {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export default function PriceGauge({ current, m }: { current: number; m: QuartileMetrics }) {
  if (!m || !(m.max > m.min)) return null;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const norm = (v: number) => clamp((v - m.min) / (m.max - m.min), 0, 1);
  const value = norm(current);
  const stops = [norm(m.q1), norm(m.q3)];
  const quartile = getQuartile(current, m);
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Historical price position</div>
      <Gauge value={value} min={0} max={1} stops={stops} />
      <div style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: 12 }}>Min ${m.min.toFixed(0)} • Q1 ${m.q1.toFixed(0)} • Median ${m.median.toFixed(0)} • Q3 ${m.q3.toFixed(0)} • Max ${m.max.toFixed(0)} ({quartile})</div>
    </div>
  );
}

function getQuartile(current: number, m: QuartileMetrics): string {
  if (current <= m.q1) return 'FIRST quartile';
  if (current <= m.median) return 'SECOND quartile';
  if (current <= m.q3) return 'THIRD quartile';
  return 'FOURTH quartile';
}


