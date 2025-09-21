import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from 'src/lib/redis';
import { NarrativeService } from 'src/services/NarrativeService';
import { PerplexityProvider } from 'src/providers/llm/PerplexityProvider';
import { ScoredOffer } from 'src/domain/types';

const narrativeSvc = new NarrativeService(new PerplexityProvider());

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  // offer is cached in Redis by SearchService
  const redis = await getRedis();
  const raw = await redis.get(id);
  if (!raw) return NextResponse.json({ error: 'offer not found' }, { status: 404 });
  let offer: ScoredOffer;
  try {
    offer = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid offer' }, { status: 500 });
  }
  if (typeof offer.score !== 'number') {
    return NextResponse.json({ error: 'offer not scored' }, { status: 422 });
  }
  try {
    const narrative = await narrativeSvc.getNarrative(offer);
    return NextResponse.json({ narrative });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'llm failed' }, { status: 500 });
  }
}
