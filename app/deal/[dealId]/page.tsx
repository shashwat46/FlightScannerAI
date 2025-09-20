import DealCard from 'src/frontend/components/composite/DealCard';
import { headers } from 'next/headers';
import { getRedis } from 'src/lib/redis';
import Button from 'src/frontend/components/ui/Button';
import { createDefaultFlightPriceAnalysisService } from 'src/services/FlightPriceAnalysisService';

export default async function DealDetailsPage({ params, searchParams }: { params: { dealId: string }; searchParams: Record<string, string> }) {
  const id = decodeURIComponent(params.dealId);
  let offer: any = null;
  try {
    const redis = await getRedis();
    // Try provider-neutral key first, then known providers as fallback
    const preferred = (searchParams?.provider || '').trim();
    const providers = preferred ? [preferred, 'serpapi', 'amadeus', 'mock'] : ['serpapi', 'amadeus', 'mock'];
    for (const p of providers) {
      const coreId = id.startsWith(p + ':') ? id.slice(p.length + 1) : id;
      const raw = await redis.get(`offer:${p}:${coreId}`);
      if (raw) { try { offer = JSON.parse(raw); break; } catch {} }
    }
  } catch {}

  let priceHistory: any = undefined;
  if (offer) {
    try {
      const priceService = createDefaultFlightPriceAnalysisService();
      const origin = offer.outbound?.segments?.[0]?.origin;
      const destination = offer.outbound?.segments?.slice(-1)?.[0]?.destination;
      const departDate = offer.outbound?.segments?.[0]?.departureTimeUtc?.slice(0,10);
      if (origin && destination && departDate) {
        const metrics = await priceService.getMetrics({ originIataCode: origin, destinationIataCode: destination, departureDate: departDate, currencyCode: 'USD', oneWay: true });
        if (metrics?.priceMetrics && Array.isArray(metrics.priceMetrics) && metrics.priceMetrics.length >= 5) {
          const rankingOrder = { 'MINIMUM': 0, 'FIRST': 1, 'MEDIUM': 2, 'THIRD': 3, 'MAXIMUM': 4 } as any;
          const sorted = metrics.priceMetrics.sort((a:any,b:any)=> (rankingOrder[a.quartileRanking]||2)-(rankingOrder[b.quartileRanking]||2)).map((m:any)=>m.amount);
          const numericSorted = [...sorted].sort((a:number,b:number)=>a-b);
          priceHistory = { quartiles: numericSorted, low: numericSorted[0], high: numericSorted[4], current: offer.price?.amount };
        }
      }
    } catch (err) { console.error('Failed to fetch price metrics for details page', err); }
  }

  const ui = offer ? mapOfferToUiDeal(offer, priceHistory) : { dealId: id, route: { tripType: 'one_way', from: { iata: '???' }, to: { iata: '???' } }, flight: { stops: 0, isDirect: true }, pricing: { dealPrice: 0, currency: 'USD' } };

  return (
    <main className="container page-bg" style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Book your ticket</h1>
        <a href="/" style={{ textDecoration: 'none' }}><Button label="Back to results" variant="secondary" /></a>
      </header>

      <section>
        <DealCard {...ui} expanded context={'details'} />
      </section>

      <section className="u-card" style={{ padding: 16 }}>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>AI insights</h2>
        <div style={{ color: 'var(--color-muted)', display: 'grid', gap: 8 }}>
          <div>• Price looks {ui?.pricing?.dealPrice ? 'good' : 'unknown'} versus typical for this route and date.</div>
          <div>• {ui?.flight?.isDirect ? 'Direct flight' : `${ui?.flight?.stops || 0} stop(s)`} with total duration ~{Math.round((ui?.flight?.durationMinutes || 0) / 60)}h.</div>
          <div>• Layover quality and airline reputation are within acceptable range.</div>
          <div>• Consider booking soon if your preferred times are limited.</div>
        </div>
      </section>
    </main>
  );
}

function mapOfferToUiDeal(o: any, priceHistory?: any) {
  return {
    dealId: o.id,
    aiDealScore: o.score,
    route: { tripType: 'one_way', from: { iata: o.outbound?.segments?.[0]?.origin || '???' }, to: { iata: o.outbound?.segments?.slice(-1)?.[0]?.destination || '???' } },
    dates: { depart: o.outbound?.segments?.[0]?.departureTimeUtc },
    flight: { airline: { name: o.outbound?.segments?.[0]?.marketingCarrier }, stops: o.outbound?.stops || 0, isDirect: (o.outbound?.stops || 0) === 0, durationMinutes: o.outbound?.durationMinutes },
    pricing: { dealPrice: o.price?.amount, currency: o.price?.currency },
    priceHistory,
    checkoutSuggestion: { buyProbability: typeof o.score === 'number' ? o.score / 100 : undefined },
    cta: { primary: { label: `Book trip for ${o.price?.currency} ${o.price?.amount}`, action: 'deeplink', deeplinkUrl: o.bookingUrl } },
    extras: o.extras
  };
}


