import { Offer, Segment } from '../../domain/types';

export function mapGoogleFlightsResponseToOffers(json: any, defaultCurrency: string): Offer[] {
    const best = Array.isArray(json?.best_flights) ? json.best_flights : [];
    const other = Array.isArray(json?.other_flights) ? json.other_flights : [];
    const flights = [...best, ...other];
    const offers: Offer[] = [];
    for (const f of flights) {
        try {
            const segments: Segment[] = Array.isArray(f?.flights)
                ? f.flights.map((s: any) => ({
                    origin: s?.departure_airport?.id,
                    destination: s?.arrival_airport?.id,
                    departureTimeUtc: toIsoUtc(s?.departure_airport?.time),
                    arrivalTimeUtc: toIsoUtc(s?.arrival_airport?.time),
                    marketingCarrier: codeFromFlightNumber(s?.flight_number),
                    operatingCarrier: undefined,
                    flightNumber: normalizeFlightNumber(s?.flight_number),
                    aircraft: s?.airplane,
                    durationMinutes: numberOrUndefined(s?.duration) || 0,
                    cabin: undefined,
                    fareClass: undefined
                }))
                : [];
            if (!segments.length) continue;

            const outboundDuration = numberOrUndefined(f?.total_duration) || sumDuration(segments);
            const stops = Math.max(0, segments.length - 1);
            const currency = String(json?.search_parameters?.currency || defaultCurrency || 'USD');
            const priceAmount = numberOrUndefined(f?.price) || 0;
            const layovers = Array.isArray(f?.layovers) ? f.layovers : [];
            const outboundLayoverMinutes = layovers.reduce((a: number, b: any) => a + (numberOrUndefined(b?.duration) || 0), 0);

            const bookingToken = f?.booking_token || undefined;
            offers.push({
                id: buildId(segments, priceAmount, currency),
                provider: 'serpapi',
                outbound: {
                    segments,
                    durationMinutes: outboundDuration,
                    stops
                },
                price: { amount: priceAmount, currency },
                cabin: 'economy',
                inbound: undefined,
                fareBrand: undefined,
                baggage: undefined,
                bookingUrl: undefined,
                extras: {
                    outboundLayoverMinutes,
                    departureTimeUtc: segments[0]?.departureTimeUtc,
                    arrivalTimeUtc: segments[segments.length - 1]?.arrivalTimeUtc,
                    bookingToken,
                    departureToken: f?.departure_token || undefined,
                    id: buildId(segments, priceAmount, currency),
                    provider: 'serpapi'
                }
            });
        } catch {}
    }
    return offers;
}

function toIsoUtc(s: any): string {
    const v = String(s || '').replace(' ', 'T');
    // Assume provided timestamps are local; keep as-is string for now
    // Consumers treat it as ISO-like; real TZ normalization can follow later
    return v.length ? v + ':00Z'.replace('::', ':') : '';
}

function numberOrUndefined(v: any): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function sumDuration(segs: Segment[]): number {
    return segs.reduce((a, s) => a + (s.durationMinutes || 0), 0);
}

function normalizeFlightNumber(s: any): string {
    const v = String(s || '').trim();
    return v.replace(/\s+/g, ' ');
}

function codeFromFlightNumber(flight: any): string {
    const v = String(flight || '').trim();
    const m = v.match(/^([A-Z0-9]{2})/i);
    return m ? m[1].toUpperCase() : '';
}

function buildId(segs: Segment[], amount: number, currency: string): string {
    const first = segs[0];
    const key = [first?.flightNumber, first?.departureTimeUtc, amount, currency].join('|');
    // Not cryptographic; deterministic for dedup
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return `serpapi:${hash.toString(16)}`;
}


