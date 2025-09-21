import { ScoredOffer } from '../../domain/types';

// Version bump when prompt schema evolves
export const PROMPT_VERSION = '1';

export function buildPrompt(offer: ScoredOffer): string {
  const outbound = offer.outbound;
  const firstSeg = outbound.segments[0];
  const lastSeg = outbound.segments[outbound.segments.length - 1];

  // Optional price history information calculated on the UI layer may be attached
  // to the offer object as `priceHistory`. We use it when available so that the LLM
  // speaks in the same terms as the visual quartile bar.
  const ph: any = (offer as any).priceHistory;

  const medianPrice = Array.isArray(ph?.quartiles) && ph.quartiles.length >= 3 ? ph.quartiles[2] : undefined;
  const priceSavingPct = medianPrice ? +(((medianPrice - offer.price.amount) / medianPrice) * 100).toFixed(1) : undefined;

  const payload = {
    price: offer.price.amount,
    currency: offer.price.currency,
    median_price: medianPrice,
    price_saving_pct: priceSavingPct,
    airline_rating: (offer.breakdown as any)?.airlineRating,
    airport_rating: Math.min((offer.breakdown as any)?.originAirportRating ?? 3, (offer.breakdown as any)?.destAirportRating ?? 3),
    stops: outbound.stops,
    total_duration_h: +(outbound.durationMinutes / 60).toFixed(1),
    baggage_included: Boolean(offer.baggage?.checked),
    origin: firstSeg.origin,
    destination: lastSeg.destination,
    depart_date: firstSeg.departureTimeUtc?.slice?.(0, 10),
    layover_minutes: (offer.extras?.outboundLayoverMinutes || 0) + (offer.extras?.inboundLayoverMinutes || 0),
    quartiles: ph?.quartiles
  };

  return [
    'You are an assistant that writes concise flight deal insights.',
    'Respond ONLY with minified JSON matching exactly this TypeScript interface (no markdown):',
    '{\n  version: "1.1",\n  deal_insight: string,\n  destination_blurb?: { pros: string; cons: string }\n}',
    '- deal_insight: ≤60 words, focus on price value and flight quality.',
    '- destination_blurb: optional, two short sentences (pros & cons) about destination or layover, each ≤40 words.',
    'User flight data:',
    JSON.stringify(payload, null, 2)
  ].join('\n');
}
