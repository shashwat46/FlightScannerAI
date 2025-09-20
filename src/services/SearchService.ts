import { getRedis } from '../lib/redis';
import { MockProvider } from '../providers/__mocks__/MockProvider';
import { AmadeusProvider } from '../providers/amadeus/AmadeusProvider';
import { GoogleFlightsProvider } from '../providers/serpapi/GoogleFlightsProvider';
import { SearchProvider } from '../providers/SearchProvider';
import { scoreOffer } from './ScoringService';
import { Offer, ScoredOffer, SearchParams, SearchResult } from '../domain/types';
import { AdvancedSearchRequest, CheapestDatesQuery, CheapestDatesResult } from '../providers/contracts';
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

	async searchAdvanced(body: AdvancedSearchRequest, includeScore?: boolean): Promise<SearchResult> {
		const rawOffers = await this.getOrFetchOffersAdvanced(body);
		const withScore = Boolean(includeScore);
		const offers: Offer[] | ScoredOffer[] = withScore ? rawOffers.map((o) => scoreOffer({ offer: o })) : rawOffers;
		const currency = offers[0]?.price.currency || body.currencyCode || 'USD';
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
				let parsed = JSON.parse(cached) as Offer[];
				const deduped = dedupOffers(parsed);
				if (deduped.length !== parsed.length) {
					await redis.set(cacheKey, JSON.stringify(deduped), { EX: this.cacheTtlSeconds });
				}
				return deduped;
			} catch {
				// fall through to refetch
			}
		}

		let offers = await this.provider.search(params);
		offers = dedupOffers(offers);
		await redis.set(cacheKey, JSON.stringify(offers), { EX: this.cacheTtlSeconds });

		try {
			for (const offer of offers) {
				const coreId = offer.id.startsWith(offer.provider + ':') ? offer.id.slice(offer.provider.length + 1) : offer.id;
				const ref = `offer:${offer.provider}:${coreId}`;
				// ensure extras enriched BEFORE caching so the details page has full data
				(offer as any).extras = { ...(offer as any).extras, offerRef: ref, id: offer.id, provider: offer.provider };
				await redis.set(ref, JSON.stringify(offer), { EX: this.cacheTtlSeconds });
			}
		} catch {}

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

	private async getOrFetchOffersAdvanced(body: AdvancedSearchRequest): Promise<Offer[]> {
		const redis = await getRedis();
		const cacheKey = this.buildAdvancedCacheKey(body);
		const cached = await redis.get(cacheKey);
		if (cached) {
			try {
				let parsed = JSON.parse(cached) as Offer[];
				const deduped = dedupOffers(parsed);
				if (deduped.length !== parsed.length) {
					await redis.set(cacheKey, JSON.stringify(deduped), { EX: this.cacheTtlSeconds });
				}
				return deduped;
			} catch {
				// continue
			}
		}

		let offers: Offer[];
		if (typeof this.provider.searchAdvanced === 'function') {
			offers = await this.provider.searchAdvanced(body);
		} else {
			const simple = reduceAdvancedToSimple(body);
			if (!simple) {
				throw new Error('Advanced search not supported by provider');
			}
			offers = dedupOffers(await this.provider.search(simple));
		}

		await redis.set(cacheKey, JSON.stringify(offers), { EX: this.cacheTtlSeconds });

		if (this.provider instanceof AmadeusProvider) {
			try {
				for (const offer of offers) {
					const ref = `amadeus:offer:${offer.id}`;
					await redis.set(ref, JSON.stringify(offer), { EX: this.cacheTtlSeconds });
					(offer as any).extras = { ...(offer as any).extras, offerRef: ref };
				}
			} catch {}
		}
		return offers;
	}

	private buildAdvancedCacheKey(body: AdvancedSearchRequest): string {
		const cacheRelevant = {
			currencyCode: body.currencyCode || null,
			originDestinations: body.originDestinations?.map((o) => ({
				originLocationCode: o.originLocationCode,
				destinationLocationCode: o.destinationLocationCode,
				date: o.departureDateTimeRange?.date || null
			})),
			travelers: body.travelers?.map((t) => ({ id: t.id, travelerType: t.travelerType })),
			criteria: body.searchCriteria?.maxFlightOffers || null,
			provider: this.provider.name
		};
		const json = JSON.stringify(cacheRelevant);
		const hash = crypto.createHash('sha1').update(json).digest('hex');
		return `search-adv:${hash}`;
	}
}

function reduceAdvancedToSimple(body: AdvancedSearchRequest): SearchParams | null {
	const od = body.originDestinations?.[0];
	if (!od) return null;
	const adults = body.travelers?.filter((t) => t.travelerType === 'ADULT').length || 1;
	return {
		origin: od.originLocationCode,
		destination: od.destinationLocationCode,
		departDate: od.departureDateTimeRange?.date || '',
		passengers: { adults },
		currency: body.currencyCode || 'USD'
	};
}

export function createDefaultSearchService(): SearchService {
    const hasSerpApi = Boolean((process.env.SERPAPI_API_KEY || '').trim());
    const hasAmadeus = Boolean((process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_APIKEY) && (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_APISECRET));
    const prefer = (process.env.DEFAULT_PROVIDER || '').trim().toLowerCase();
    let provider: SearchProvider;
    if (prefer === 'amadeus' && hasAmadeus) provider = new AmadeusProvider();
    else if (prefer === 'serpapi' && hasSerpApi) provider = new GoogleFlightsProvider();
    else if (hasSerpApi) provider = new GoogleFlightsProvider();
    else if (hasAmadeus) provider = new AmadeusProvider();
    else provider = new MockProvider();
    return new SearchService(provider);
}

function dedupOffers<T extends Offer>(offers: T[]): T[] {
    const seen = new Map<string, T>();
    for (const o of offers) {
        const sig = buildSig(o);
        if (!seen.has(sig)) seen.set(sig, o);
    }
    return Array.from(seen.values());
}

function buildSig(o: Offer): string {
    const outSeg = o.outbound.segments[0];
    const keyParts = [
        outSeg.flightNumber,
        outSeg.departureTimeUtc,
        o.inbound?.segments?.[0]?.departureTimeUtc || '',
        o.price.amount,
        o.extras?.fareBrand || '',
        o.extras?.fareClass || '',
        o.extras?.refundable ? 'R' : '',
        o.cabin
    ];
    return keyParts.join('|');
}


