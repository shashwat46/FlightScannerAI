import DealCard from 'src/frontend/components/composite/DealCard';
import { headers } from 'next/headers';
import { getJson } from 'src/frontend/lib/api';

export default async function DealDetailsPage({ params }: { params: { dealId: string } }) {
  const host = headers().get('host');
  const protocol = process.env.VERCEL ? 'https' : 'http';
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : '');
  let ui: any = null;
  try {
    const body = { offerRefs: [decodeURIComponent(params.dealId)] } as any;
    const priced = await getJson<{ offers: any[] }>(`${base}/api/pricing`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
    const o = priced.offers?.[0];
    if (o) {
      ui = mapOfferToUiDeal(o);
    }
  } catch {}
  if (!ui) {
    ui = { dealId: params.dealId, route: { tripType: 'one_way', from: { iata: '???' }, to: { iata: '???' } }, flight: { stops: 0, isDirect: true }, pricing: { dealPrice: 0, currency: 'USD' } };
  }
  return (
    <main className="container page-bg">
      <DealCard {...ui} expanded />
    </main>
  );
}

function mapOfferToUiDeal(o: any) {
  return {
    dealId: o.id,
    aiDealScore: o.score,
    route: { tripType: 'one_way', from: { iata: o.outbound?.segments?.[0]?.origin || '???' }, to: { iata: o.outbound?.segments?.slice(-1)?.[0]?.destination || '???' } },
    dates: { depart: o.outbound?.segments?.[0]?.departureTimeUtc },
    flight: { airline: { name: o.outbound?.segments?.[0]?.marketingCarrier }, stops: o.outbound?.stops || 0, isDirect: (o.outbound?.stops || 0) === 0, durationMinutes: o.outbound?.durationMinutes },
    pricing: { dealPrice: o.price?.amount, currency: o.price?.currency },
    priceHistory: undefined,
    checkoutSuggestion: { buyProbability: typeof o.score === 'number' ? o.score / 100 : undefined },
    cta: { primary: { label: `Book trip for ${o.price?.currency} ${o.price?.amount}`, action: 'deeplink', deeplinkUrl: o.bookingUrl } }
  };
}


