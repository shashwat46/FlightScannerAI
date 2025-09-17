import { getRedis } from '../lib/redis';
import { AmadeusProvider } from '../providers/amadeus/AmadeusProvider';
import { SearchProvider } from '../providers/SearchProvider';
import { CheapestDatesQuery, CheapestDatesResult } from '../providers/contracts';
import crypto from 'crypto';
import { ConfigError } from '../domain/errors';

export class CheapestDatesService {
  private readonly provider: SearchProvider;
  private readonly cacheTtlSeconds: number;

  constructor(provider: SearchProvider, options?: { cacheTtlSeconds?: number }) {
    this.provider = provider;
    this.cacheTtlSeconds = options?.cacheTtlSeconds ?? 3600;
  }

  async search(params: CheapestDatesQuery): Promise<CheapestDatesResult> {
    const redis = await getRedis();
    const cacheKey = this.buildCacheKey(params);
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as CheapestDatesResult;
      } catch {}
    }

    if (typeof this.provider.searchCheapestDates !== 'function') {
      throw new ConfigError('Cheapest dates not supported by provider');
    }
    const result = await this.provider.searchCheapestDates(params);
    await redis.set(cacheKey, JSON.stringify(result), { EX: this.cacheTtlSeconds });
    return result;
  }

  private buildCacheKey(params: CheapestDatesQuery): string {
    const cacheRelevant = {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate || null,
      oneWay: typeof params.oneWay === 'boolean' ? params.oneWay : null,
      duration: params.duration || null,
      nonStop: typeof params.nonStop === 'boolean' ? params.nonStop : null,
      viewBy: params.viewBy || null,
      provider: (this.provider && this.provider.name) || 'unknown'
    };
    const json = JSON.stringify(cacheRelevant);
    const hash = crypto.createHash('sha1').update(json).digest('hex');
    return `dates:${hash}`;
  }
}

export function createDefaultCheapestDatesService(): CheapestDatesService {
  const hasAmadeus = Boolean(
    (process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_APIKEY) &&
      (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_APISECRET)
  );
  if (!hasAmadeus) {
    throw new ConfigError('Amadeus credentials are required for Cheapest Date Search');
  }
  const provider = new AmadeusProvider();
  return new CheapestDatesService(provider);
}


