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
          <div className={styles['deal-card__priceRow']}>
            <div>
              <div className={styles['deal-card__price-label']}>Deal price</div>
              <div className={styles['deal-card__price']}>{formatCurrency(pricing.dealPrice, pricing.currency)}</div>
            </div>
            <div className={styles['deal-card__timeline']}>
              <div>
                <div style={{ textAlign: 'center', fontWeight: 800 }}>{dates?.depart ? new Date(dates.depart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                <span className={styles['deal-card__timelineCode']}>{route.from.iata}</span>
              </div>
              <div className={styles['deal-card__timelineColCenter']}>
                <span className={styles['deal-card__timelineMetaTop']}>{extras?.durationMinutes ? Math.round((extras.durationMinutes as any) / 60) + 'h ' + ((extras.durationMinutes as any) % 60) : ''}</span>
                <div className={styles['deal-card__timelineLine']}>
                  <span className={styles['deal-card__plane']}><Plane size={14} color="#64748b" /></span>
                </div>
                <span className={styles['deal-card__timelineMetaBottom']}>{(flight?.stops || 0) === 0 ? 'Direct' : `${flight?.stops} stop${(flight?.stops || 0) > 1 ? 's' : ''}`}</span>
              </div>
              <div>
                <div style={{ textAlign: 'center', fontWeight: 800 }}>{extras?.arrivalTimeUtc ? new Date(extras.arrivalTimeUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                <span className={styles['deal-card__timelineCode']}>{route.to.iata}</span>
              </div>
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

            <div style={{ marginTop: 12 }}>
              <div className={styles['deal-card__section-title']}>Booking options</div>
              {!extras?.bookingToken && <div className={styles['deal-card__muted']}>Booking options unavailable for this result.</div>}
              {extras?.bookingToken && (
                <div>
                  {bookingLoading && <div className={styles['deal-card__muted']}>Fetching booking options…</div>}
                  {bookingError && <div className={styles['deal-card__muted']} style={{ color: '#b91c1c' }}>{bookingError}</div>}
                  {!bookingLoading && bookingData && Array.isArray(bookingData.bookingOptions) && bookingData.bookingOptions.length > 0 && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {bookingData.bookingOptions.map((opt: any, idx: number) => {
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
                          <div key={idx} className={styles['deal-card__included']} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span className={styles['badge']}>{together?.book_with || 'Seller'}</span>
                              {Array.isArray(together?.airline_logos) && together.airline_logos[0] && (
                                <img src={together.airline_logos[0]} alt="logo" width={20} height={20} style={{ borderRadius: 4 }} />
                              )}
                              <span className={styles['deal-card__muted']}>{currency} {price != null && !isNaN(price) ? price : '—'}</span>
                            </div>
                            {url ? (
                              <a href={url} target="_blank" rel="noopener noreferrer"><Button label={`Book with ${together?.book_with || 'Seller'}`} /></a>
                            ) : (
                              <span className={styles['deal-card__muted']}>No redirect</span>
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


      <footer className={styles['deal-card__footerSection']}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          {viewContext === 'list' ? (
            <div className={styles['deal-card__sliders']}>
              <PriceInsights from={route.from.iata} to={route.to.iata} depart={dates?.depart} currency={pricing.currency} currentPrice={pricing.dealPrice} oneWay={route.tripType === 'one_way'} priceHistory={priceHistory} />
            </div>
          ) : (
            <Button label={isExpanded ? 'Hide details' : 'View insights'} variant="secondary" onClick={() => setIsExpanded((v) => !v)} />
          )}
        </div>
        <div>
          {viewContext === 'list' ? (
            <Link href={dealHref}><Button label="See offers" /></Link>
          ) : (
            bookingData?.bestOption?.together?.booking_request?.url ? (
              <a href={buildGetUrl(bookingData.bestOption.together.booking_request.url, bookingData.bestOption.together.booking_request.post_data)} target="_blank" rel="noopener noreferrer"><Button label={`Book with ${bookingData.bestOption?.together?.book_with || 'Best option'}`} /></a>
            ) : (
              <Button label={isExpanded ? 'Hide details' : 'View details'} variant="secondary" onClick={() => setIsExpanded((v) => !v)} />
            )
          )}
        </div>
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


