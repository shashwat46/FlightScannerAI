"use client";
import React from 'react';
import Link from 'next/link';
import { UiDeal } from '../../../schemas/viewModels';
import Button from '../../ui/Button';
import { formatCurrency } from '../../ui/currency';
import styles from './styles.module.css';
import RingScore from '../../ui/RingScore';
import { Plane } from 'lucide-react';
import PriceInsights from '../../ui/PriceInsights';

export default function DealCard({ aiDealScore, route, dates, flight, pricing, priceHistory, checkoutSuggestion, cta, expanded, extras, breakdown, context }: UiDeal & { expanded?: boolean; extras?: any; breakdown?: any; context?: 'list' | 'details' }) {
  const viewContext: 'list' | 'details' = context || 'list';
  const [isExpanded, setIsExpanded] = React.useState(Boolean(expanded));
  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingData, setBookingData] = React.useState<any | null>(null);

  const dealHref: string = React.useMemo(() => {
    const id = (extras && (extras.id as string))
      || (typeof (route as any)?.dealId === 'string' ? (route as any).dealId : '')
      || (typeof (pricing as any)?.id === 'string' ? (pricing as any).id : '');
    if (!id) return '#';
    const provider = (extras && (extras.provider as string)) || '';
    const base = `/deal/${encodeURIComponent(String(id))}`;
    return provider ? `${base}?provider=${encodeURIComponent(provider)}` : base;
  }, [extras, route, pricing]);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchOptions() {
      if (viewContext !== 'details') return;
      if (!isExpanded) return;
      const token = (extras && (extras as any).bookingToken) as string | undefined;
      if (!token || bookingData) return;
      try {
        setBookingLoading(true);
        setBookingError(null);
        // SerpApi booking-options accepts only booking_token, currency, deep_search.
        if (!token) {
          setBookingError('No booking token available for this itinerary.');
          return;
        }
        const params: Record<string,string> = { booking_token: token, currency: pricing.currency || 'USD' };
        if (route?.from?.iata) params['departure_id'] = route.from.iata;
        if (route?.to?.iata) params['arrival_id'] = route.to.iata;
        if (dates?.depart) params['outbound_date'] = new Date(dates.depart).toISOString().slice(0,10);
        const q = new URLSearchParams(params);
        const res = await fetch(`/api/booking-options?${q.toString()}`);
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            setBookingError(json?.error || 'Failed to load booking options');
          } else {
            setBookingData(json);
          }
        }
      } catch (e: any) {
        if (!cancelled) setBookingError(e?.message || 'Failed to load booking options');
      } finally {
        if (!cancelled) setBookingLoading(false);
      }
    }
    fetchOptions();
    return () => { cancelled = true; };
  }, [isExpanded, extras, pricing?.currency, viewContext]);
  return (
    <article className={styles['deal-card']} data-context={viewContext}>
      <header className={`${styles['deal-card__header']} ${styles['deal-card__topRow']}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CarrierBadge code={(flight as any)?.airline?.carrierCode || '??'} name={(flight as any)?.airline?.name} />
        </div>
        <div className={styles['deal-card__route']}>
          <strong>{route.from.iata}</strong> → <strong>{route.to.iata || 'ANY'}</strong>
        </div>
        <div className={styles['deal-card__topRight']}>
          {dates?.depart && <span className={styles['deal-card__date']}>{new Date(dates.depart).toLocaleDateString()}</span>}
        </div>
      </header>

      <div className={`${styles['deal-card__grid']} grid gap-md` }>
        <div className={styles['deal-card__prices']}>
          <div className={styles['deal-card__priceRow']}>
            <div>
              <div className={styles['deal-card__price-label']}>Deal price</div>
              <div className={styles['deal-card__price']}>{formatCurrency(pricing.dealPrice, pricing.currency)}</div>
            </div>
            <div className={styles['deal-card__timeline']}>
              <div className={styles['deal-card__timelineStation']}>
                <div className={styles['deal-card__timelineTime']}>
                  {dates?.depart ? new Date(dates.depart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <div className={styles['deal-card__timelineCode']}>{route.from.iata}</div>
              </div>
              <div className={styles['deal-card__timelineColCenter']}>
                <div className={styles['deal-card__timelineMetaTop']}>
                  {extras?.durationMinutes ? 
                    `${Math.floor((extras.durationMinutes as any) / 60)}h ${(extras.durationMinutes as any) % 60 > 0 ? (extras.durationMinutes as any) % 60 : ''}`.trim() : 
                    ''}
                </div>
                <div className={styles['deal-card__timelineLine']}>
                  <span className={styles['deal-card__plane']}>
                    <Plane size={16} color="var(--color-accent)" />
                  </span>
                </div>
                <div className={styles['deal-card__timelineMetaBottom']}>
                  {(flight?.stops || 0) === 0 ? 'Direct' : `${flight?.stops} stop${(flight?.stops || 0) > 1 ? 's' : ''}`}
                </div>
              </div>
              <div className={styles['deal-card__timelineStation']}>
                <div className={styles['deal-card__timelineTime']}>
                  {extras?.arrivalTimeUtc ? new Date(extras.arrivalTimeUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <div className={styles['deal-card__timelineCode']}>{route.to.iata}</div>
              </div>
            </div>
            {typeof aiDealScore === 'number' && aiDealScore > 0 && (
              <div className={styles['deal-card__priceScore']}>
                <RingScore 
                  value={aiDealScore} 
                  size={44}
                  breakdown={breakdown}
                  dealHref={dealHref}
                  interactive={true}
                />
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

        {isExpanded && viewContext === 'details' && (
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

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <div className={styles['deal-card__section-title']}>Booking options</div>
              {!extras?.bookingToken && (
                <div style={{ 
                  background: 'var(--color-secondary)', 
                  padding: 'var(--space-lg)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)',
                  textAlign: 'center'
                }}>
                  <div className={styles['deal-card__muted']}>Booking options unavailable for this result.</div>
                </div>
              )}
              {extras?.bookingToken && (
                <div>
                  {bookingLoading && (
                    <div style={{ 
                      background: 'var(--color-secondary)', 
                      padding: 'var(--space-lg)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--color-border)',
                      textAlign: 'center'
                    }}>
                      <div className={styles['deal-card__muted']}>Loading booking options...</div>
                    </div>
                  )}
                  {bookingError && (
                    <div style={{ 
                      background: '#fef2f2', 
                      padding: 'var(--space-lg)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid #fecaca',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'var(--color-danger)' }}>{bookingError}</div>
                    </div>
                  )}
                  {!bookingLoading && bookingData && Array.isArray(bookingData.bookingOptions) && bookingData.bookingOptions.length > 0 && (
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                      {bookingData.bookingOptions.slice(0, 3).map((opt: any, idx: number) => {
                        const together = opt?.together || opt?.departing || opt?.returning;
                        if (!together) return null;
                        const toNumber = (v: any): number | undefined => {
                          if (v == null) return undefined;
                          if (typeof v === 'number') return v;
                          if (typeof v === 'string') {
                            const cleaned = v.replace(/[^0-9.]/g, '');
                            const num = parseFloat(cleaned);
                            return isNaN(num) ? undefined : num;
                          }
                          return undefined;
                        };
                        const price = toNumber(together?.local_prices?.[0]?.price) ?? toNumber(together?.price);
                        const currency = together?.local_prices?.[0]?.currency || together?.currency || pricing.currency || 'USD';
                        const url = together?.booking_request?.url ? buildGetUrl(together.booking_request.url, together.booking_request.post_data) : null;
                        return (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: 'var(--space-lg)',
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                {Array.isArray(together?.airline_logos) && together.airline_logos[0] && (
                                  <img src={together.airline_logos[0]} alt="logo" width={24} height={24} style={{ borderRadius: 4 }} />
                                )}
                                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{together?.book_with || 'Provider'}</span>
                              </div>
                              <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>
                                {currency} {price != null && !isNaN(price) ? price : '—'}
                              </span>
                            </div>
                            {url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Button label="Select" variant="primary" />
                              </a>
                            ) : (
                              <span className={styles['deal-card__muted']}>Unavailable</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {viewContext === 'details' && bookingData?.bestOption?.together?.booking_request?.url && (
        <footer className={styles['deal-card__footerSection']} style={{ justifyContent: 'center', paddingTop: 'var(--space-md)' }}>
          <a href={buildGetUrl(bookingData.bestOption.together.booking_request.url, bookingData.bestOption.together.booking_request.post_data)} target="_blank" rel="noopener noreferrer">
            <Button label={`Book with ${bookingData.bestOption?.together?.book_with || 'Best option'}`} />
          </a>
        </footer>
      )}
      
      {viewContext === 'list' && (
        <footer className={styles['deal-card__footerSection']}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <div className={styles['deal-card__sliders']}>
              <PriceInsights from={route.from.iata} to={route.to.iata} depart={dates?.depart} currency={pricing.currency} currentPrice={pricing.dealPrice} oneWay={route.tripType === 'one_way'} priceHistory={priceHistory} />
            </div>
          </div>
          <div>
            <Link href={dealHref}><Button label="Select flight" /></Link>
          </div>
        </footer>
      )}
    </article>
  );
}

function CarrierBadge({ code, name }: { code: string; name?: string }) {
  const airlineCode = (code || '').toUpperCase();
  const logoUrl = `http://img.wway.io/pics/root/${airlineCode}@png?exar=1&rs=fit:48:48`;
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <span style={{ 
        display: 'inline-flex', 
        width: 40, 
        height: 40, 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'white', 
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        <img 
          src={logoUrl}
          alt={`${airlineCode} logo`}
          style={{ 
            width: '32px', 
            height: '32px', 
            objectFit: 'contain'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <span 
          className="fallback"
          style={{ 
            display: 'none',
            fontWeight: 700, 
            fontSize: 12,
            color: 'var(--color-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {airlineCode.slice(0, 2)}
        </span>
      </span>
      {name && <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{name}</span>}
    </span>
  );
}

// no helpers here; presentation-only component

function buildGetUrl(url: string, postData?: string): string {
  if (!postData) return url;
  try {
    const params = new URLSearchParams();
    const pairs = String(postData).split('&');
    for (const p of pairs) {
      const idx = p.indexOf('=');
      if (idx > 0) params.set(decodeURIComponent(p.slice(0, idx)), decodeURIComponent(p.slice(idx + 1)));
    }
    const u = new URL(url);
    for (const [k, v] of params) u.searchParams.set(k, v as any);
    return u.toString();
  } catch {
    return url;
  }
}


