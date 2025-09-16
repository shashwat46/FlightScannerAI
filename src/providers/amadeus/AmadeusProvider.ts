import Amadeus from 'amadeus';
import { Offer, SearchParams } from '../../domain/types';
import { SearchProvider } from '../SearchProvider';
import { ProviderError, ValidationError } from '../../domain/errors';
import { AdvancedSearchRequest } from '../contracts';
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




