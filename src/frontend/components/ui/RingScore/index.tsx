import React, { useState } from 'react';
import ScoreOverviewPopover from '../ScoreOverviewPopover';
import { ScoreBreakdown } from '../../../../domain/types';

interface Props {
  value: number;
  size?: number;
  breakdown?: ScoreBreakdown;
  dealHref?: string;
  interactive?: boolean;
}

export default function RingScore({ value, size = 56, breakdown, dealHref, interactive = false }: Props) {
  const [showPopover, setShowPopover] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
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
  const handleMouseEnter = () => {
    if (interactive && breakdown && dealHref) {
      const timeout = setTimeout(() => {
        setShowPopover(true);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowPopover(false);
  };

  const containerStyle = {
    ...style,
    cursor: interactive ? 'pointer' : 'default'
  };

  return (
    <>
      <span 
        style={containerStyle} 
        aria-label={`Score ${clamped}`} 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={inner}>{Math.round(clamped)}</span>
      </span>

      {showPopover && breakdown && dealHref && (
        <ScoreOverviewPopover
          score={Math.round(clamped)}
          breakdown={breakdown}
          dealHref={dealHref}
          onClose={() => setShowPopover(false)}
        />
      )}
    </>
  );
}


