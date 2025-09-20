import { SearchProvider } from '../SearchProvider';
import { Offer, SearchParams } from '../../domain/types';
import { ProviderError, ValidationError } from '../../domain/errors';
import { mapGoogleFlightsResponseToOffers } from './map';

function getSerpApiKey(): string {
    const key = (process.env.SERPAPI_API_KEY || '').trim();
    if (!key) throw new ValidationError('Missing SERPAPI_API_KEY');
    return key;
}

export class GoogleFlightsProvider implements SearchProvider {
    public readonly name = 'serpapi';

    async search(params: SearchParams): Promise<Offer[]> {
        if (!params.origin) throw new ValidationError('origin is required');
        if (!params.departDate) throw new ValidationError('departDate is required');
        if (!params.destination) throw new ValidationError('destination is required');

        const apiKey = getSerpApiKey();
        const searchParams = new URLSearchParams();
        searchParams.set('engine', 'google_flights');
        searchParams.set('departure_id', params.origin);
        searchParams.set('arrival_id', params.destination);
        searchParams.set('outbound_date', params.departDate);
        if (params.returnDate) searchParams.set('return_date', params.returnDate);
        // Set flight type: 1=Round trip, 2=One way
        const isOneWay = Boolean(params.oneWay) || !params.returnDate;
        searchParams.set('type', isOneWay ? '2' : '1');
        if (params.cabin) searchParams.set('travel_class', mapCabinToSerpApi(params.cabin));
        if (params.currency) searchParams.set('currency', params.currency);
        searchParams.set('hl', 'en');
        // Include passengers
        searchParams.set('adults', String(params.passengers?.adults ?? 1));
        // deep_search now defaults to true to ensure booking_token presence; disable by setting SERPAPI_DEEP_SEARCH_DEFAULT=false
        const deepSearchEnv = String(process.env.SERPAPI_DEEP_SEARCH_DEFAULT || 'true').toLowerCase();
        if (deepSearchEnv !== 'false') {
            searchParams.set('deep_search', 'true');
        }
        if (typeof params.maxStops === 'number') searchParams.set('stops', mapStops(params.maxStops));
        // Let SerpApi use cache by default for speed/cost
        // searchParams.set('no_cache', 'false');
        searchParams.set('api_key', apiKey);

        const url = `https://serpapi.com/search.json?${searchParams.toString()}`;
        let json: any;
        try {
            const res = await fetch(url, { method: 'GET' });
            json = await res.json();
        } catch (e: any) {
            throw new ProviderError('SerpApi request failed', { cause: e });
        }

        const defaultCurrency = params.currency || 'USD';
        try {
            return mapGoogleFlightsResponseToOffers(json, defaultCurrency);
        } catch (e: any) {
            throw new ProviderError('SerpApi mapping failed', { cause: e });
        }
    }
}

function mapCabinToSerpApi(cabin: string): string {
    switch (cabin) {
        case 'economy':
            return '1';
        case 'premium_economy':
            return '2';
        case 'business':
            return '3';
        case 'first':
            return '4';
        default:
            return '1';
    }
}

function mapStops(maxStops: number): string {
    if (maxStops <= 0) return '1';
    if (maxStops === 1) return '2';
    if (maxStops === 2) return '3';
    return '0';
}


