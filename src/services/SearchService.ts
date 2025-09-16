import { getRedis } from '../lib/redis';
import { MockProvider } from '../providers/__mocks__/MockProvider';
import { SearchProvider } from '../providers/SearchProvider';
import { scoreOffer } from './ScoringService';
import { Offer, ScoredOffer, SearchParams, SearchResult } from '../domain/types';
import crypto from 'crypto';

export interface SearchServiceOptions {
	cacheTtlSeconds?: number;
}

export class SearchService {
	private readonly provider: SearchProvider;
	private readonly cacheTtlSeconds: number;

	constructor(provider: SearchProvider, options?: SearchServiceOptions) {
		this.provider = provider;
		this.cacheTtlSeconds = options?.cacheTtlSeconds ?? 600; // 10 minutes
	}

	async search(params: SearchParams): Promise<SearchResult> {
		const rawOffers = await this.getOrFetchOffers(params);

		const includeScore = Boolean(params.includeScore);
		const offers: Offer[] | ScoredOffer[] = includeScore
			? rawOffers.map((o) => scoreOffer({ offer: o }))
			: rawOffers;

		const currency = offers[0]?.price.currency || params.currency || 'USD';
		return {
			offers,
			count: offers.length,
			currency,
			provider: this.provider.name
		};
	}

	private async getOrFetchOffers(params: SearchParams): Promise<Offer[]> {
		const redis = await getRedis();
		const cacheKey = this.buildCacheKey(params);
		const cached = await redis.get(cacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached) as Offer[];
				return parsed;
			} catch {
				// fall through to refetch
			}
		}

		const offers = await this.provider.search(params);
		await redis.set(cacheKey, JSON.stringify(offers), { EX: this.cacheTtlSeconds });
		return offers;
	}

	private buildCacheKey(params: SearchParams): string {
		const cacheRelevant = {
			origin: params.origin,
			destination: params.destination || null,
			departDate: params.departDate,
			returnDate: params.returnDate || null,
			oneWay: Boolean(params.oneWay),
			passengers: params.passengers,
			cabin: params.cabin || null,
			currency: params.currency || null,
			maxStops: typeof params.maxStops === 'number' ? params.maxStops : null,
			sortBy: params.sortBy || null,
			provider: this.provider.name
		};
		const json = JSON.stringify(cacheRelevant);
		const hash = crypto.createHash('sha1').update(json).digest('hex');
		return `search:${hash}`;
	}
}

export function createDefaultSearchService(): SearchService {
	const provider = new MockProvider();
	return new SearchService(provider);
}


