"use client";
import React from 'react';
import { UiDeal } from '../../../schemas/viewModels';
import Button from '../../ui/Button';
import { formatCurrency } from '../../ui/currency';
import styles from './styles.module.css';
import RingScore from '../../ui/RingScore';
import PriceInsights from '../../ui/PriceInsights';

export default function DealCard({ aiDealScore, route, dates, flight, pricing, priceHistory, checkoutSuggestion, cta, expanded, extras, breakdown }: UiDeal & { expanded?: boolean; extras?: any; breakdown?: any }) {
  const [isExpanded, setIsExpanded] = React.useState(Boolean(expanded));
  return (
    <article className={`u-card ${styles['deal-card']} u-card-tw`}>
      <header className={`${styles['deal-card__header']} ${styles['deal-card__topRow']}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CarrierBadge code={(flight as any)?.airline?.carrierCode || '??'} name={(flight as any)?.airline?.name} />
        </div>
        <div className={styles['deal-card__route']}>
          <strong>{route.from.iata}</strong> → <strong>{route.to.iata || 'ANY'}</strong>
        </div>
        <div className={styles['deal-card__topRight']}>
          {dates?.depart && <span className={styles['deal-card__date']}>{new Date(dates.depart).toLocaleDateString()} | {extras?.departureTimeUtc ? new Date(extras.departureTimeUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null}</span>}
        </div>
      </header>

      <div className={`${styles['deal-card__grid']} grid gap-md` }>
        <div className={styles['deal-card__prices']}>
          <div className={`${styles['deal-card__priceRow']} flex items-center justify-between`}>
            <div>
              <div className={styles['deal-card__price-label']}>Deal price</div>
              <div className={styles['deal-card__price']}>{formatCurrency(pricing.dealPrice, pricing.currency)}</div>
            </div>
            {typeof aiDealScore === 'number' && (
              <div className={styles['deal-card__priceScore']}>
                <RingScore value={aiDealScore} size={44} />
              </div>
            )}
          </div>
          {typeof pricing.regularPrice === 'number' && (
            <div>
              <div className={styles['deal-card__price-label']}>Regular price</div>
              <div className={styles['deal-card__muted']}>{formatCurrency(pricing.regularPrice, pricing.currency)}</div>
            </div>
          )}
          {typeof pricing.priceDiff === 'number' && (
            <div>
              <div className={styles['deal-card__price-label']}>Price difference</div>
              <div className={styles['deal-card__good']}>{pricing.priceDiff}</div>
            </div>
          )}
          {typeof pricing.discountPct === 'number' && (
            <div>
              <div className={styles['deal-card__price-label']}>Price change</div>
              <div className={styles['deal-card__good']}>{Math.round(pricing.discountPct * 100)}%</div>
            </div>
          )}
        </div>

        {/* top sliders removed per spec; keep insights below */}

        {isExpanded && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className={styles['divider']} />
            
            {/* Two-column layout for expanded content */}
            <div className={styles['deal-card__expandedGrid']}>
              <div>
                <div className={styles['deal-card__section-title']}>What's included</div>
                <div className={styles['deal-card__included']}>
                  <span className={styles['badge']}>Cabin: {(extras && extras.fareBrandLabel) || 'Economy'}</span>
                  {extras?.fareClass && <span className={styles['badge']}>Class: {extras.fareClass}</span>}
                  {extras?.numberOfBookableSeats && <span className={styles['badge']}>{extras.numberOfBookableSeats} seats left</span>}
                  {extras?.mealIncluded && <span className={styles['chip']}><span className={styles['icon']}>🍽️</span> Meal included</span>}
                  {extras?.mealChargeable && !extras?.mealIncluded && <span className={styles['chip']}><span className={styles['icon']}>💲</span> Meal available</span>}
                  {extras?.refundable !== undefined && <span className={styles['chip']}><span className={styles['icon']}>↺</span> {extras.refundable ? 'Refundable' : 'Non‑refundable'}</span>}
                  {extras?.changeable !== undefined && <span className={styles['chip']}><span className={styles['icon']}>✎</span> {extras.changeable ? 'Changeable' : 'No changes'}</span>}
                  {extras?.includedCheckedBagsOnly && <span className={styles['chip']}><span className={styles['icon']}>🧳</span> Checked bag</span>}
                </div>
              </div>
              
              <div>
                <PriceInsights from={route.from.iata} to={route.to.iata} depart={dates?.depart} currency={pricing.currency} currentPrice={pricing.dealPrice} oneWay={route.tripType === 'one_way'} priceHistory={priceHistory} />
              </div>
            </div>
          </div>
        )}
      </div>


      <footer className={`${styles['deal-card__footer']} flex items-center justify-end gap-2`}>
        <Button label={isExpanded ? 'Hide details' : 'View insights'} variant="secondary" onClick={() => setIsExpanded((v) => !v)} />
        {cta?.primary && <Button label={cta.primary.label.replace(/^[A-Z]{3}\s/, formatCurrency(pricing.dealPrice, pricing.currency))} />}
      </footer>
    </article>
  );
}

function CarrierBadge({ code, name }: { code: string; name?: string }) {
  const label = (code || '').toUpperCase().slice(0, 2);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#0f172a', borderRadius: 6, fontWeight: 800, fontSize: 12 }}>{label}</span>
      {name && <span style={{ fontWeight: 700 }}>{name}</span>}
    </span>
  );
}

// no helpers here; presentation-only component


