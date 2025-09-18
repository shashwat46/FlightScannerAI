import Amadeus from 'amadeus';
import { Offer, SearchParams } from '../../domain/types';
import { SearchProvider } from '../SearchProvider';
import { ProviderError, ValidationError } from '../../domain/errors';
import { AdvancedSearchRequest, PriceFlightOffersRequest, CheapestDatesQuery, CheapestDatesResult, InspirationSearchQuery, InspirationSearchResult, ItineraryPriceMetricsQuery, ItineraryPriceMetricsResult } from '../contracts';
import { mapOffer } from './map';

function getEitherEnv(primary: string, fallback: string): string | null {
	const a = process.env[primary]?.trim();
	if (a) return a;
	const b = process.env[fallback]?.trim();
	return b || null;
}

let singleton: any | null = null;

export class AmadeusProvider implements SearchProvider {
	public readonly name = 'amadeus';
	private readonly sdk: any;

	constructor() {
		const clientId = getEitherEnv('AMADEUS_CLIENT_ID', 'AMADEUS_APIKEY');
		const clientSecret = getEitherEnv('AMADEUS_CLIENT_SECRET', 'AMADEUS_APISECRET');
		if (!clientId || !clientSecret) {
			throw new ValidationError('Missing Amadeus credentials');
		}
		if (!singleton) {
			singleton = new (Amadeus as any)({ clientId, clientSecret });
		}
		this.sdk = singleton;
	}

	async search(params: SearchParams): Promise<Offer[]> {
		if (!params.origin) throw new ValidationError('origin is required');
		if (!params.departDate) throw new ValidationError('departDate is required');

		if (!params.destination) throw new ValidationError('destination is required');
		const query: Record<string, string> = {
			originLocationCode: params.origin,
			destinationLocationCode: params.destination,
			departureDate: params.departDate,
			adults: String(params.passengers?.adults ?? 1)
		};
		if (params.returnDate) query.returnDate = params.returnDate;
		if (params.cabin) query.travelClass = mapCabin(params.cabin);
		if (params.currency) query.currencyCode = params.currency;

		try {
			const res = await this.sdk.shopping.flightOffersSearch.get(query);
			const data = res.data as any[];
			return (data || []).map(mapOffer(params.currency || 'USD'));
		} catch (e: any) {
			throw new ProviderError('Amadeus search failed', { cause: e });
		}
	}

	async searchAdvanced(body: AdvancedSearchRequest): Promise<Offer[]> {
		try {
			const res = await this.sdk.shopping.flightOffersSearch.post(body as any);
			const data = res.data as any[];
			return (data || []).map(mapOffer(body.currencyCode || 'USD'));
		} catch (e: any) {
			throw new ProviderError('Amadeus advanced search failed', { cause: e });
		}
	}

	async priceFlightOffers(req: PriceFlightOffersRequest): Promise<Offer[]> {
		try {
			const res = await this.sdk.shopping.flightOffers.pricing.post(req as any);
			const data = (res?.data?.flightOffers || res?.data || res?.result?.data?.flightOffers || []) as any[];
			const defaultCurrency = data[0]?.price?.currency || 'USD';
			return (data || []).map(mapOffer(defaultCurrency));
		} catch (e: any) {
			throw new ProviderError('Amadeus pricing failed', { cause: e });
		}
	}

    async searchCheapestDates(params: CheapestDatesQuery): Promise<CheapestDatesResult> {
        try {
            const query: Record<string, string> = {
                origin: params.origin,
                destination: params.destination,
                departureDate: params.departureDate,
            };
            if (params.returnDate) query.returnDate = params.returnDate;
            if (typeof params.oneWay === 'boolean') query.oneWay = String(params.oneWay);
            if (params.duration) query.duration = params.duration;
            if (typeof params.nonStop === 'boolean') query.nonStop = String(params.nonStop);
            if (params.viewBy) query.viewBy = params.viewBy;
            const res = await this.sdk.shopping.flightDates.get(query);
            const data = res?.data || [];
            const items = (data as any[]).map((d: any) => ({
                departureDate: d?.departureDate,
                returnDate: d?.returnDate,
                priceTotal: Number(d?.price?.total || 0),
                flightOffersLink: d?.links?.flightOffers,
            }));
            const currency = (res?.meta?.currency || params.currencyCode || undefined) as string | undefined;
            return { provider: this.name, currency, items, count: items.length };
        } catch (e: any) {
            throw new ProviderError('Amadeus cheapest dates failed', { cause: e });
        }
    }

    async searchInspiration(params: InspirationSearchQuery): Promise<InspirationSearchResult> {
        try {
            const query: Record<string, string> = {
                origin: params.origin
            };
            if (params.departureDate) query.departureDate = params.departureDate;
            if (typeof params.oneWay === 'boolean') query.oneWay = String(params.oneWay);
            if (params.duration) query.duration = params.duration;
            if (typeof params.nonStop === 'boolean') query.nonStop = String(params.nonStop);
            if (typeof params.maxPrice === 'number') query.maxPrice = String(Math.max(0, Math.floor(params.maxPrice)));
            if (params.viewBy) query.viewBy = params.viewBy;
            const res = await this.sdk.shopping.flightDestinations.get(query);
            const data = res?.data || [];
            const items = (data as any[]).map((d: any) => ({
                origin: d?.origin,
                destination: d?.destination,
                departureDate: d?.departureDate,
                returnDate: d?.returnDate,
                priceTotal: Number(d?.price?.total || 0),
                links: {
                    flightDates: d?.links?.flightDates,
                    flightOffers: d?.links?.flightOffers
                }
            }));
            const currency = (res?.meta?.currency || params.currencyCode || undefined) as string | undefined;
            return { provider: this.name, currency, items, count: items.length };
        } catch (e: any) {
            throw new ProviderError('Amadeus inspiration search failed', { cause: e });
        }
    }

    async getItineraryPriceMetrics(params: ItineraryPriceMetricsQuery): Promise<ItineraryPriceMetricsResult> {
        try {
            const query: Record<string, string> = {
                originIataCode: params.originIataCode,
                destinationIataCode: params.destinationIataCode,
                departureDate: params.departureDate
            };
            if (params.currencyCode) query.currencyCode = params.currencyCode;
            if (typeof params.oneWay === 'boolean') query.oneWay = String(params.oneWay);
            // Amadeus SDK exposes snake_case for analytics resources
            let res: any = null;
            const metricsApi = (this.sdk.analytics as any)?.itinerary_price_metrics || (this.sdk.analytics as any)?.itineraryPriceMetrics;
            if (metricsApi?.get) {
                res = await metricsApi.get(query);
            } else {
                // Fallback: make raw client request (SDK v3.3 lacks this helper)
                res = await this.sdk.client.get('/v1/analytics/itinerary-price-metrics', query);
            }
            const first = Array.isArray(res?.data) ? (res.data as any[])[0] : undefined;
            const entries = Array.isArray(first?.priceMetrics)
                ? (first.priceMetrics as any[])
                : [];
            const currencyCode = (first?.currencyCode || params.currencyCode || 'USD') as string;
            return {
                provider: this.name,
                originIataCode: params.originIataCode,
                destinationIataCode: params.destinationIataCode,
                departureDate: params.departureDate,
                currencyCode,
                oneWay: Boolean(first?.oneWay ?? params.oneWay ?? false),
                priceMetrics: entries.map((e: any) => ({
                    amount: Number(e?.amount || 0),
                    quartileRanking: String(e?.quartileRanking || 'MEDIUM') as any
                }))
            };
        } catch (e: any) {
            throw new ProviderError('Amadeus itinerary price metrics failed', { cause: e });
        }
    }
}

function mapCabin(cabin: string): string {
	switch (cabin) {
		case 'economy':
			return 'ECONOMY';
		case 'premium_economy':
			return 'PREMIUM_ECONOMY';
		case 'business':
			return 'BUSINESS';
		case 'first':
			return 'FIRST';
		default:
			return 'ECONOMY';
	}
}




