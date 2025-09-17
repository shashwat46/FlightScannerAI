import { getRedis } from '../lib/redis';
import { Offer } from '../domain/types';
import { AmadeusProvider } from '../providers/amadeus/AmadeusProvider';
import { PriceFlightOffersRequest } from '../providers/contracts';

export class PricingService {
	private readonly provider: AmadeusProvider;
	private readonly cacheTtlSeconds: number;

	constructor(provider: AmadeusProvider, options?: { cacheTtlSeconds?: number }) {
		this.provider = provider;
		this.cacheTtlSeconds = options?.cacheTtlSeconds ?? 600;
	}

	async priceByRefs(offerRefs: string[], include?: string[], forceClass?: boolean): Promise<Offer[]> {
		const redis = await getRedis();
		const flightOffers: any[] = [];
		for (const ref of offerRefs) {
			const raw = await redis.get(ref);
			if (raw) {
				try {
					flightOffers.push(JSON.parse(raw));
				} catch {}
			}
		}
		const req: PriceFlightOffersRequest = { data: { type: 'flight-offers-pricing', flightOffers }, include, forceClass } as any;
		return this.provider.priceFlightOffers!(req);
	}

	async priceByBody(req: PriceFlightOffersRequest): Promise<Offer[]> {
		return this.provider.priceFlightOffers!(req);
	}
}

export function createDefaultPricingService(): PricingService {
	const provider = new AmadeusProvider();
	return new PricingService(provider);
}


