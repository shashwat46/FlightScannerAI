import React from 'react';

interface Props {
  value: number; // 0..100
  size?: number; // px
}

export default function RingScore({ value, size = 56 }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const bg = `conic-gradient(#0ea5e9 ${clamped}%, #e2e8f0 ${clamped}% 100%)`;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: bg,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#0f172a'
  };
  const inner: React.CSSProperties = {
    width: size - 16,
    height: size - 16,
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  return (
    <span style={style} aria-label={`Score ${clamped}`}>
      <span style={inner}>{Math.round(clamped)}</span>
    </span>
  );
}


