import { getRedis } from '../lib/redis';
import { SearchProvider } from '../providers/SearchProvider';
import { AmadeusProvider } from '../providers/amadeus/AmadeusProvider';
import { InspirationSearchQuery, InspirationSearchResult } from '../providers/contracts';
import crypto from 'crypto';
import { ConfigError } from '../domain/errors';

export class InspirationService {
  private readonly provider: SearchProvider;
  private readonly cacheTtlSeconds: number;

  constructor(provider: SearchProvider, options?: { cacheTtlSeconds?: number }) {
    this.provider = provider;
    this.cacheTtlSeconds = options?.cacheTtlSeconds ?? 3600;
  }

  async search(params: InspirationSearchQuery): Promise<InspirationSearchResult> {
    const redis = await getRedis();
    const cacheKey = this.buildCacheKey(params);
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as InspirationSearchResult;
      } catch {}
    }

    if (typeof this.provider.searchInspiration !== 'function') {
      throw new ConfigError('Inspiration search not supported by provider');
    }
    const result = await this.provider.searchInspiration(params);
    await redis.set(cacheKey, JSON.stringify(result), { EX: this.cacheTtlSeconds });
    return result;
  }

  private buildCacheKey(params: InspirationSearchQuery): string {
    const cacheRelevant = {
      origin: params.origin,
      departureDate: params.departureDate || null,
      oneWay: typeof params.oneWay === 'boolean' ? params.oneWay : null,
      duration: params.duration || null,
      nonStop: typeof params.nonStop === 'boolean' ? params.nonStop : null,
      maxPrice: typeof params.maxPrice === 'number' ? params.maxPrice : null,
      viewBy: params.viewBy || null,
      provider: (this.provider && this.provider.name) || 'unknown'
    };
    const json = JSON.stringify(cacheRelevant);
    const hash = crypto.createHash('sha1').update(json).digest('hex');
    return `inspiration:${hash}`;
  }
}

export function createDefaultInspirationService(): InspirationService {
  const hasAmadeus = Boolean(
    (process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_APIKEY) &&
      (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_APISECRET)
  );
  if (!hasAmadeus) {
    throw new ConfigError('Amadeus credentials are required for Inspiration Search');
  }
  const provider = new AmadeusProvider();
  return new InspirationService(provider);
}


