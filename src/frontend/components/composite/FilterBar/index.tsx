"use client";
import React from 'react';
import Button from '../../ui/Button';
import styles from './styles.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Repeat, Route as RouteIcon, Calendar, User, MapPin } from 'lucide-react';

interface Props {
  tripType?: 'one_way' | 'round_trip';
  stops?: 'direct' | 'max_1' | 'any';
  sortMode?: 'ai_score' | 'price_diff' | 'price_change' | 'price_from';
}

export default function FilterBar(_props: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [origin, setOrigin] = React.useState((sp.get('origin') || '').toUpperCase());
  const [destination, setDestination] = React.useState((sp.get('destination') || '').toUpperCase());
  const [departDate, setDepartDate] = React.useState(sp.get('departDate') || '');
  const [tripType, setTripType] = React.useState<'one_way' | 'round_trip'>('one_way');
  const [stops, setStops] = React.useState<'any' | 'direct' | 'max_1' | 'max_2'>('any');
  const [travelers, setTravelers] = React.useState<number>(1);
  const [cabin, setCabin] = React.useState<'economy' | 'premium_economy' | 'business' | 'first'>('economy');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const from = (origin || '').trim().toUpperCase();
    const to = (destination || '').trim().toUpperCase();
    if (from.length !== 3) return;
    const query = new URLSearchParams();
    if (departDate) query.set('departDate', departDate);
    query.set('passengers', JSON.stringify({ adults: travelers }));
    query.set('cabin', cabin);
    if (stops !== 'any') query.set('maxStops', stops === 'direct' ? '0' : (stops === 'max_1' ? '1' : '2'));
    if (tripType === 'round_trip') query.set('oneWay', 'false');
    const isAnywhere = to.length !== 3;
    const path = isAnywhere ? `/from/${from}/anywhere` : `/from/${from}/to/${to}`;
    router.push(`${path}?${query.toString()}`);
  }

  return (
    <div className={styles.panel}>
      <form onSubmit={onSubmit}>
        <div className={styles.rowTop}>
          <div className={styles.pill}><Repeat size={16} /><select className={styles['filter-bar__select--bare']} value={tripType} onChange={(e) => setTripType(e.target.value as any)}>
            <option value="one_way">One-way</option>
            <option value="round_trip">Round-trip</option>
          </select></div>
          <div className={styles.pill}><RouteIcon size={16} /><select className={styles['filter-bar__select--bare']} value={stops} onChange={(e) => setStops(e.target.value as any)}>
            <option value="any">Any stops</option>
            <option value="direct">Direct</option>
            <option value="max_1">Max 1 stop</option>
            <option value="max_2">Max 2 stops</option>
          </select></div>
        </div>

        <div className={styles.rowBottom}>
          <div className={styles.field}><span className={styles.label}>Departing from</span><div className={styles.inputPill}><MapPin size={16} /><input className={styles['filter-bar__input--bare']} value={origin} placeholder="Origin (IATA)" name="origin" onChange={(e) => setOrigin(e.target.value.toUpperCase())} /></div></div>
          <div className={styles.field}><span className={styles.label}>Going to</span><div className={styles.inputPill}><MapPin size={16} /><input className={styles['filter-bar__input--bare']} value={destination} placeholder="Destination (IATA or empty)" name="destination" onChange={(e) => setDestination(e.target.value.toUpperCase())} /></div></div>
          <div className={styles.field}><span className={styles.label}>Dates & Duration</span>
            <button type="button" onClick={() => (document.getElementById('departDatePicker') as HTMLInputElement)?.showPicker?.() || (document.getElementById('departDatePicker') as HTMLInputElement)?.click()} className={styles.inputPill} style={{ width: '100%' }}>
              <Calendar size={16} />
              <input id="departDatePicker" className={styles['filter-bar__input--bare']} type="date" value={departDate} name="departDate" onChange={(e) => setDepartDate(e.target.value)} />
            </button>
          </div>
          <div className={styles.field}><span className={styles.label}>Travelers & class</span><div className={styles.combo}> <div className={styles.inputPill}><User size={16} /><input className={styles['filter-bar__input--bare']} style={{ flex: 1 }} type="number" min={1} max={9} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(9, Number(e.target.value))))} placeholder="1" /></div>
            <select className={styles['filter-bar__select']} style={{ flex: 1 }} value={cabin} onChange={(e) => setCabin(e.target.value as any)}>
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select></div></div>
          <div className={styles.action}><Button type="submit" label="Search" /></div>
        </div>
      </form>
    </div>
  );
}


