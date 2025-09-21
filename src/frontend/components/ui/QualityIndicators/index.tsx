'use client';
import React from 'react';
import { Star, Building, AlertTriangle, CheckCircle, Clock, Plane } from 'lucide-react';
import { ScoreBreakdown } from '../../../../domain/types';
import styles from './styles.module.css';

interface QualityIndicatorsProps {
  breakdown: ScoreBreakdown;
  route: { from: { iata: string }; to: { iata: string } };
  flight: { stops: number; durationMinutes: number };
}

export default function QualityIndicators({ breakdown, route, flight }: QualityIndicatorsProps) {
  const pros = generatePros(breakdown, flight);
  const cons = generateCons(breakdown, flight);

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        {pros.map((item, index) => (
          <div key={index} className={styles.indicator}>
            <div className={styles.iconSuccess}>
              <item.icon size={16} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className={styles.column}>
        {cons.map((item, index) => (
          <div key={index} className={styles.indicator}>
            <div className={styles.iconWarning}>
              <item.icon size={16} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function generatePros(breakdown: ScoreBreakdown, flight: { stops: number; durationMinutes: number }) {
  const pros = [];

  if (breakdown.airlineRating && breakdown.airlineRating >= 4) {
    pros.push({
      icon: Star,
      label: `${breakdown.airlineRating}-star airline`
    });
  }

  if (breakdown.originAirportRating && breakdown.originAirportRating >= 4) {
    pros.push({
      icon: Building,
      label: 'Premium origin airport'
    });
  }

  if (breakdown.destAirportRating && breakdown.destAirportRating >= 4) {
    pros.push({
      icon: Building,
      label: 'Premium destination airport'
    });
  }

  if (flight.stops === 0) {
    pros.push({
      icon: Plane,
      label: 'Direct flight'
    });
  }

  if (breakdown.priceVsMedian > 15) {
    pros.push({
      icon: CheckCircle,
      label: 'Excellent price'
    });
  }

  return pros;
}

function generateCons(breakdown: ScoreBreakdown, flight: { stops: number; durationMinutes: number }) {
  const cons = [];

  if (breakdown.airlineRating && breakdown.airlineRating < 3) {
    cons.push({
      icon: AlertTriangle,
      label: 'Low-rated airline'
    });
  }

  if (breakdown.originAirportRating && breakdown.originAirportRating < 3) {
    cons.push({
      icon: AlertTriangle,
      label: 'Basic origin airport'
    });
  }

  if (breakdown.destAirportRating && breakdown.destAirportRating < 3) {
    cons.push({
      icon: AlertTriangle,
      label: 'Basic destination airport'
    });
  }

  if (flight.stops > 1) {
    cons.push({
      icon: Clock,
      label: `${flight.stops} stops`
    });
  }

  if (breakdown.priceVsMedian < -15) {
    cons.push({
      icon: AlertTriangle,
      label: 'Above average price'
    });
  }

  return cons;
}
