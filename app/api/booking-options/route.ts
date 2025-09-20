import { NextRequest, NextResponse } from 'next/server';
import { toHttpResponse, ValidationError } from '../../../src/domain/errors';
import { getRedis } from '../../../src/lib/redis';

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const url = new URL(req.url);
        const bookingToken = (url.searchParams.get('booking_token') || '').trim();
        const currency = (url.searchParams.get('currency') || 'USD').trim();
        const deepSearch = String(url.searchParams.get('deep_search') || '').toLowerCase() === 'true';
        const depId = (url.searchParams.get('departure_id') || '').trim();
        const arrId = (url.searchParams.get('arrival_id') || '').trim();
        const outboundDate = (url.searchParams.get('outbound_date') || '').trim();
        const returnDate = (url.searchParams.get('return_date') || '').trim();

        if (!bookingToken && !(depId && arrId && outboundDate)) {
            throw new ValidationError('Either booking_token or (departure_id, arrival_id, outbound_date) are required');
        }
        const apiKey = (process.env.SERPAPI_API_KEY || '').trim();
        if (!apiKey) throw new ValidationError('Missing SERPAPI_API_KEY');

        // Build cache key – primary by booking_token, else by route/date
        const cacheKeyParts = ['bookingOpts'];
        if (bookingToken) cacheKeyParts.push(`token:${bookingToken}`);
        if (depId && arrId && outboundDate) cacheKeyParts.push(`route:${depId}-${arrId}-${outboundDate}`);
        cacheKeyParts.push(`cur:${currency}`);
        const cacheKey = cacheKeyParts.join('|');

        // Attempt to read from Redis cache first
        try {
            const redis = await getRedis();
            const cached = await redis.get(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                return NextResponse.json(parsed, { status: 200 });
            }
        } catch (err) {
            // Log and continue without failing request
            console.error('Booking options cache read failed', err);
        }

        const qp = new URLSearchParams();
        // SerpApi docs: use google_flights engine with search_type=booking_options
        qp.set('engine', 'google_flights');
        qp.set('search_type', 'booking_options');
        // include SerpApi API key (required)
        qp.set('api_key', apiKey);
        if (bookingToken) qp.set('booking_token', bookingToken);

        if (depId) qp.set('departure_id', depId);
        if (arrId) qp.set('arrival_id', arrId);
        if (outboundDate) qp.set('outbound_date', outboundDate);
        qp.set('currency', currency);
        // Set trip type: 1=Round trip, 2=One way. If no return_date, assume one-way.
        if (!returnDate) qp.set('type', '2');
        else qp.set('return_date', returnDate);
        // strict: only booking_token, currency, deep_search allowed
        if (deepSearch) qp.set('deep_search', 'true');

        const serpUrl = `https://serpapi.com/search.json?${qp.toString()}`;
        const res = await fetch(serpUrl);
        const json = await res.json().catch(() => ({} as any));
        if (!res.ok) {
            const msg = (json && (json.error || json.message)) || `SerpApi error: HTTP ${res.status}`;
            throw new ValidationError(String(msg));
        }
        if (json?.search_metadata?.status === 'Error' || json?.error) {
            throw new ValidationError(String(json?.error || 'SerpApi returned error status'));
        }

        const options = Array.isArray(json?.booking_options) ? json.booking_options : [];
        const together = options.map((o: any) => o?.together).filter(Boolean);
        together.sort((a: any, b: any) => (a?.price ?? Infinity) - (b?.price ?? Infinity));
        const best = together[0] || null;

        const deeplink = best?.booking_request?.url
            ? buildGetUrl(best.booking_request.url, best.booking_request.post_data)
            : null;

        const responseBody = {
            provider: 'serpapi',
            bookingOptions: options,
            bestOption: best || undefined,
            deeplinkUrl: deeplink || undefined,
            baggagePrices: json?.baggage_prices || undefined,
            searchMetadata: json?.search_metadata || undefined
        };

        // Store in cache (TTL 30 min configurable)
        try {
            const redis = await getRedis();
            const ttl = Number(process.env.BOOKING_OPTIONS_CACHE_TTL || '1800'); // seconds
            await redis.set(cacheKey, JSON.stringify(responseBody), { EX: ttl });
        } catch (err) {
            console.error('Booking options cache write failed', err);
        }

        return NextResponse.json(responseBody, { status: 200 });
    } catch (err) {
        const { status, body } = toHttpResponse(err);
        return NextResponse.json(body, { status });
    }
}

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
        for (const [k, v] of params) u.searchParams.set(k, v);
        return u.toString();
    } catch {
        return url;
    }
}


