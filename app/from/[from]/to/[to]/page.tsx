import { getJson } from 'src/frontend/lib/api';
import { headers } from 'next/headers';
import ResultsHeader from 'src/frontend/components/composite/ResultsHeader';
import DealCard from 'src/frontend/components/composite/DealCard';
import SectionHeader from 'src/frontend/components/composite/SectionHeader';
import Pagination from 'src/frontend/components/ui/Pagination';
import LoadingHandler from './LoadingHandler';
import { createDefaultFlightPriceAnalysisService } from '../../../../../src/services/FlightPriceAnalysisService';
import { UiDeal } from 'src/frontend/schemas/viewModels';

interface SearchResponse { offers: Array<any>; }

export default async function DestinationPage({ params, searchParams }: { params: { from: string; to: string }; searchParams: Record<string, string> }) {
  const origin = params.from.toUpperCase();
  const destination = params.to.toUpperCase();
  const departDate = searchParams.departDate || new Date().toISOString().slice(0, 10);
  const passengers = (() => {
    try { return JSON.parse(searchParams.passengers || '') || { adults: 1 }; } catch { return { adults: 1 }; }
  })();
  const cabin = (searchParams.cabin || 'economy') as any;
  const currency = (searchParams.currency || 'USD') as any;
  const query = new URLSearchParams({ origin, destination, departDate, includeScore: 'true', passengers: JSON.stringify(passengers), cabin, currency });
  if (searchParams.oneWay != null) query.set('oneWay', String(searchParams.oneWay));
  if (searchParams.maxStops != null) query.set('maxStops', String(searchParams.maxStops));
  const host = headers().get('host');
  const protocol = process.env.VERCEL ? 'https' : 'http';
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : '');
  const data = await getJson<SearchResponse>(`${base}/api/search?${query.toString()}`).catch(() => ({ offers: [] }) as SearchResponse);
  
  // Fetch price metrics ONCE for the route/date - shared by all cards
  let sharedPriceHistory = undefined;
  try {
    const priceService = createDefaultFlightPriceAnalysisService();
    const metrics = await priceService.getMetrics({
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate: departDate,
      currencyCode: 'USD',
      oneWay: true
    });
    
    if (metrics?.priceMetrics && Array.isArray(metrics.priceMetrics) && metrics.priceMetrics.length >= 5) {
      // Sort by quartile ranking order: MINIMUM, FIRST, MEDIUM, THIRD, MAXIMUM
      const rankingOrder = { 'MINIMUM': 0, 'FIRST': 1, 'MEDIUM': 2, 'THIRD': 3, 'MAXIMUM': 4 };
      const sorted = metrics.priceMetrics
        .sort((a, b) => (rankingOrder[a.quartileRanking] || 2) - (rankingOrder[b.quartileRanking] || 2))
        .map(m => m.amount);
      
      // Double-check: sort by actual amounts as fallback
      const numericSorted = [...sorted].sort((a, b) => a - b);
      
      if (sorted.length >= 5) {
        sharedPriceHistory = {
          quartiles: numericSorted, // Use numeric sort to ensure proper order
          low: numericSorted[0],
          high: numericSorted[4],
          current: undefined
        };
        console.log('Price metrics sorted:', { original: sorted, numericSorted });
      }
    }
  } catch (error) {
    console.error('Failed to fetch price metrics for route:', error);
  }

  const page = Number(searchParams.page || '1');
  const pageSize = 10;
  const offers = (data.offers || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const slice = offers.slice(start, end);
  const uiTop = slice[0] ? mapOfferToUiDeal(slice[0], sharedPriceHistory) : null;
  const rest = slice.slice(1).map((o) => mapOfferToUiDeal(o, sharedPriceHistory));
  const totalPages = Math.max(1, Math.ceil(offers.length / pageSize));
  const hasData = offers.length > 0;
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <LoadingHandler hasData={hasData} />
      <ResultsHeader />
      
      <main className="container" style={{ 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-2xl)',
        background: 'var(--color-bg)'
      }}>
        <SectionHeader title="Deals to Destination" subtitle={`Page ${page} of ${totalPages}`} />
        {uiTop && <DealCard {...uiTop} expanded />}
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {rest.map((d) => (
            <DealCard key={d.dealId} {...d} />
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} makeHref={(p) => buildHref(params.from, params.to, departDate, p)} />
      </main>
    </div>
  );
}

function mapOfferToUiDeal(o: any, priceHistory?: any): UiDeal {
  const code = o.outbound?.segments?.[0]?.marketingCarrier || '';
  return {
    dealId: o.id,
    aiDealScore: o.score,
    route: { tripType: 'one_way', from: { iata: o.outbound?.segments?.[0]?.origin || '???' }, to: { iata: o.outbound?.segments?.slice(-1)?.[0]?.destination || '???' } },
    dates: { depart: o.outbound?.segments?.[0]?.departureTimeUtc },
    flight: { airline: { name: lookupCarrierName(code), reputationScore: undefined as any, carrierCode: code }, stops: o.outbound?.stops || 0, isDirect: (o.outbound?.stops || 0) === 0, durationMinutes: o.outbound?.durationMinutes },
    pricing: { dealPrice: o.price?.amount, currency: o.price?.currency },
    priceHistory,
    checkoutSuggestion: { buyProbability: typeof o.score === 'number' ? o.score / 100 : undefined },
    cta: { primary: { label: `Book trip for ${o.price?.currency} ${o.price?.amount}`, action: 'deeplink', deeplinkUrl: o.bookingUrl } },
    extras: o.extras,
    breakdown: o.breakdown
  };
}

function buildHref(from: string, to: string, departDate: string, page: number) {
  const sp = new URLSearchParams({ departDate, page: String(page) });
  return `/from/${from}/to/${to}?${sp.toString()}`;
}

function lookupCarrierName(code: string): string {
  const map: Record<string, string> = {
    AI: 'Air India',
    IX: 'Air India Express',
    UL: 'SriLankan Airlines',
    MH: 'Malaysia Airlines',
    SQ: 'Singapore Airlines',
    QF: 'Qantas',
    EK: 'Emirates',
    OD: 'Malindo Air',
    VJ: 'VietJet Air',
    H1: 'Hahn Air'
  };
  return map[(code || '').toUpperCase()] || code || '';
}


