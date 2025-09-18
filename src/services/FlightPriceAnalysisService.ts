import { getRedis } from '../lib/redis';
import { AmadeusProvider } from '../providers/amadeus/AmadeusProvider';
import { SearchProvider } from '../providers/SearchProvider';
import { ItineraryPriceMetricsQuery, ItineraryPriceMetricsResult } from '../providers/contracts';
import { ConfigError } from '../domain/errors';
import crypto from 'crypto';

export class FlightPriceAnalysisService {
  private readonly provider: SearchProvider;
  private readonly cacheTtlSeconds: number;

  constructor(provider: SearchProvider, options?: { cacheTtlSeconds?: number }) {
    this.provider = provider;
    this.cacheTtlSeconds = options?.cacheTtlSeconds ?? 3600;
  }

  async getMetrics(params: ItineraryPriceMetricsQuery): Promise<ItineraryPriceMetricsResult> {
    const redis = await getRedis();
    const cacheKey = this.buildCacheKey(params);
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as ItineraryPriceMetricsResult;
      } catch {}
    }

    if (typeof this.provider.getItineraryPriceMetrics !== 'function') {
      throw new ConfigError('Itinerary price metrics not supported by provider');
    }
    const result = await this.provider.getItineraryPriceMetrics(params);
    await redis.set(cacheKey, JSON.stringify(result), { EX: this.cacheTtlSeconds });
    return result;
  }

  private buildCacheKey(params: ItineraryPriceMetricsQuery): string {
    const cacheRelevant = {
      originIataCode: params.originIataCode,
      destinationIataCode: params.destinationIataCode,
      departureDate: params.departureDate,
      currencyCode: params.currencyCode,
      oneWay: params.oneWay ?? false
    } as const;
    const hash = crypto.createHash('sha1').update(JSON.stringify(cacheRelevant)).digest('hex');
    return `ipa:${hash}`;
  }
}

export function createDefaultFlightPriceAnalysisService(): FlightPriceAnalysisService {
  const hasAmadeus = Boolean(
    (process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_APIKEY) &&
      (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_APISECRET)
  );
  if (!hasAmadeus) {
    throw new ConfigError('Amadeus credentials are required for Flight Price Analysis');
  }
  const provider = new AmadeusProvider();
  return new FlightPriceAnalysisService(provider);
}




