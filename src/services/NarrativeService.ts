import crypto from 'crypto';
import { ScoredOffer } from '../domain/types';
import { getRedis } from '../lib/redis';
import { NarrativeProvider } from '../providers/llm/NarrativeProvider';
import { buildPrompt, PROMPT_VERSION } from '../providers/llm/PromptBuilder';
import { DealNarrative } from '../schemas/narrative';

export class NarrativeService {
  constructor(private provider: NarrativeProvider, private cacheTtl = 60 * 60 * 24 * 30) {}

  private cacheKey(offer: ScoredOffer): string {
    const sigObj = {
      v: PROMPT_VERSION,
      id: offer.id,
      score: offer.score,
      price: offer.price.amount
    };
    return 'narr:' + crypto.createHash('sha1').update(JSON.stringify(sigObj)).digest('hex');
  }

  async getNarrative(offer: ScoredOffer): Promise<DealNarrative | string> {
    const key = this.cacheKey(offer);
    const redis = await getRedis();
    const hit = await redis.get(key);
    if (hit) {
      // Try to parse cached data as DealNarrative first
      try {
        const parsed = JSON.parse(hit);
        if (parsed && typeof parsed === 'object' && parsed.deal_insight) {
          return parsed as DealNarrative;
        }
      } catch {
        // If parsing fails, return as string
      }
      return hit;
    }

    const prompt = buildPrompt(offer);
    const result = await this.provider.generate(prompt);
    
    // Cache the result (serialize if it's an object)
    const cacheValue = typeof result === 'object' ? JSON.stringify(result) : result;
    redis.set(key, cacheValue, { EX: this.cacheTtl }).catch(() => {});
    
    return result;
  }
}
