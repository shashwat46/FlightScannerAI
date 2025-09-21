'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, Clock, Star, ExternalLink } from 'lucide-react';
import { ScoreBreakdown } from '../../../../domain/types';
import styles from './styles.module.css';

interface ScoreOverviewPopoverProps {
  score: number;
  breakdown: ScoreBreakdown;
  dealHref: string;
  onClose: () => void;
}

export default function ScoreOverviewPopover({ score, breakdown, dealHref, onClose }: ScoreOverviewPopoverProps) {
  const insights = generateInsights(breakdown);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popover} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.score}>{score}/100</span>
          <span className={styles.title}>Deal Score</span>
        </div>
        
        <div className={styles.insights}>
          {insights.map((insight, index) => (
            <div key={index} className={styles.insight}>
              <insight.icon size={16} className={styles[insight.variant]} />
              <span>{insight.label}</span>
            </div>
          ))}
        </div>

        <Link href={dealHref} className={styles.detailLink} onClick={onClose}>
          <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}

function generateInsights(breakdown: ScoreBreakdown) {
  const insights = [];

  if (breakdown.priceVsMedian > 10) {
    insights.push({
      icon: DollarSign,
      label: 'Great price',
      variant: 'success'
    });
  } else if (breakdown.priceVsMedian < -10) {
    insights.push({
      icon: DollarSign,
      label: 'Above average price',
      variant: 'warning'
    });
  }

  if (breakdown.airlineQuality > 70) {
    insights.push({
      icon: Star,
      label: 'Quality airline',
      variant: 'success'
    });
  } else if (breakdown.airlineQuality < 50) {
    insights.push({
      icon: Star,
      label: 'Budget airline',
      variant: 'warning'
    });
  }

  if (breakdown.durationPenalty > 80) {
    insights.push({
      icon: Clock,
      label: 'Short duration',
      variant: 'success'
    });
  } else if (breakdown.durationPenalty < 40) {
    insights.push({
      icon: Clock,
      label: 'Long duration',
      variant: 'warning'
    });
  }

  return insights.slice(0, 3);
}
