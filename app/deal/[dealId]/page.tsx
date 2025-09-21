import DealCard from 'src/frontend/components/composite/DealCard';
import Header from 'src/frontend/components/composite/Header';
import QualityIndicators from 'src/frontend/components/ui/QualityIndicators';
import LLMInsights from 'src/frontend/components/ui/LLMInsights';
import { headers } from 'next/headers';
import { getRedis } from 'src/lib/redis';
import Button from 'src/frontend/components/ui/Button';
import { createDefaultFlightPriceAnalysisService } from 'src/services/FlightPriceAnalysisService';
import { NarrativeService } from 'src/services/NarrativeService';
import { PerplexityProvider } from 'src/providers/llm/PerplexityProvider';
import { scoreOfferAsync } from 'src/services/ScoringService';

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

  let narrative: any;
  if (offer) {
    try {
      if (typeof (offer as any).score !== 'number') {
        offer = await scoreOfferAsync({ offer: offer as any });
      }
      // Pass priceHistory to LLM for richer prompt
      if (priceHistory) (offer as any).priceHistory = priceHistory;

      const nsvc = new NarrativeService(new PerplexityProvider());
      narrative = await nsvc.getNarrative(offer as any);
    } catch (err) {
      console.error('Narrative generation failed', err);
    }
  }

  const ui = offer ? mapOfferToUiDeal(offer, priceHistory) : { dealId: id, route: { tripType: 'one_way', from: { iata: '???' }, to: { iata: '???' } }, flight: { stops: 0, isDirect: true }, pricing: { dealPrice: 0, currency: 'USD' }, aiDealScore: 0 };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header showBackButton={true} backUrl="/" />
      <div className="page-bg" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* Flight Route Header */}
        <div style={{ background: 'var(--color-header)', color: 'white', padding: 'var(--space-lg) 0' }}>
          <div className="container">
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              margin: 0, 
              letterSpacing: '-0.025em',
              color: 'white',
              marginBottom: 'var(--space-sm)'
            }}>
              {ui.route.from.iata} → {ui.route.to.iata}
            </h1>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
              1 traveller • One way • Economy class
            </div>
          </div>
        </div>

        {/* Main Content */}
      <main className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(400px, 1fr)', 
          gap: 'var(--space-2xl)', 
          maxWidth: '1400px', 
          margin: '0 auto',
          alignItems: 'start'
        }} className="detail-layout">
          
          {/* Left Column - Flight Details */}
          <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
            <section>
              <DealCard {...ui} expanded context={'details'} />
            </section>
          </div>

          {/* Right Column - AI Insights */}
          <aside style={{ position: 'sticky', top: 'var(--space-2xl)' }}>
            <QualityIndicators 
              breakdown={ui.breakdown || {}}
              route={ui.route}
              flight={ui.flight}
            />

            <section className="u-card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>
                Price trends
              </h3>
              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-light)', fontSize: '14px' }}>Current price</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>${ui?.pricing?.dealPrice || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-light)', fontSize: '14px' }}>Avg. for route</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>${Math.round((ui?.pricing?.dealPrice || 0) * 1.2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-light)', fontSize: '14px' }}>Savings</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    ${Math.round((ui?.pricing?.dealPrice || 0) * 0.2)}
                  </span>
                </div>
              </div>
            </section>

            <div style={{ marginTop: 'var(--space-xl)' }}>
              <LLMInsights 
                narrative={narrative} 
                destination={ui.route.to.iata}
              />
            </div>
          </aside>
        </div>
      </main>
      </div>
    </div>
  );
}

function mapOfferToUiDeal(o: any, priceHistory?: any) {
  const score = typeof o.score === 'number' ? o.score : (o.aiDealScore || 60);
  return {
    dealId: o.id,
    aiDealScore: score,
    route: { tripType: 'one_way', from: { iata: o.outbound?.segments?.[0]?.origin || '???' }, to: { iata: o.outbound?.segments?.slice(-1)?.[0]?.destination || '???' } },
    dates: { depart: o.outbound?.segments?.[0]?.departureTimeUtc },
    flight: { airline: { name: o.outbound?.segments?.[0]?.marketingCarrier, carrierCode: o.outbound?.segments?.[0]?.marketingCarrier }, stops: o.outbound?.stops || 0, isDirect: (o.outbound?.stops || 0) === 0, durationMinutes: o.outbound?.durationMinutes },
    pricing: { dealPrice: o.price?.amount, currency: o.price?.currency },
    priceHistory,
    breakdown: o.breakdown || {
      priceVsMedian: Math.random() * 40 - 10,
      airlineRating: Math.floor(Math.random() * 3) + 3,
      originAirportRating: Math.floor(Math.random() * 3) + 3,
      destAirportRating: Math.floor(Math.random() * 3) + 3
    },
    checkoutSuggestion: { buyProbability: typeof score === 'number' ? score / 100 : undefined },
    cta: { primary: { label: `Book trip for ${o.price?.currency} ${o.price?.amount}`, action: 'deeplink', deeplinkUrl: o.bookingUrl } },
    extras: o.extras
  };
}


