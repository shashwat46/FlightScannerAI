import { NarrativeProvider } from './NarrativeProvider';
import { DealNarrative, DealNarrativeSchema } from '../../schemas/narrative';

interface PplxOptions {
  model?: string;
  temperature?: number;
  seed?: number;
}

export class PerplexityProvider implements NarrativeProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly seed?: number;

  constructor(options: PplxOptions = {}) {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) throw new Error('Missing PERPLEXITY_API_KEY');
    this.model = options.model || process.env.PERPLEXITY_MODEL || 'sonar';
    this.temperature = options.temperature ?? Number(process.env.PERPLEXITY_TEMP || 0.2);
    const seedRaw = options.seed ?? process.env.PERPLEXITY_SEED;
    if (seedRaw !== undefined) this.seed = Number(seedRaw);
  }

  async generate(prompt: string, options?: Record<string, unknown>): Promise<DealNarrative | string> {
    const body: any = {
      model: this.model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: this.temperature,
      top_p: 0.9,
      max_tokens: 160
    };
    if (this.seed !== undefined && !Number.isNaN(this.seed)) body.seed = this.seed;

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PPLX error ${res.status}: ${text}`);
    }
    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content || '';
    const content = raw.trim();
    
    // Try to parse as DealNarrative JSON first
    try {
      const obj = JSON.parse(content);
      
      // Validate against schema
      const parseResult = DealNarrativeSchema.safeParse(obj);
      if (parseResult.success) {
        return parseResult.data;
      }
      
      // Legacy support - if it has deal_insight or narrative, extract as string
      if (typeof obj.deal_insight === 'string') {
        return obj.deal_insight.trim();
      } else if (typeof obj.narrative === 'string') {
        return obj.narrative.trim();
      }
    } catch {
      // Not valid JSON, return raw content as string
    }
    
    return content;
  }
}
