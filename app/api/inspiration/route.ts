import { NextRequest, NextResponse } from 'next/server';
import { createDefaultInspirationService } from '../../../src/services/InspirationService';
import { toHttpResponse, ValidationError } from '../../../src/domain/errors';
import { inspirationQuerySchema } from '../../../src/domain/validation';

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  const v = value.toLowerCase();
  return v === 'true' || v === '1';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const q = url.searchParams;
    const origin = q.get('origin');
    if (!origin) throw new ValidationError('origin is required');
    const maxPriceStr = q.get('maxPrice');
    const params = {
      origin,
      departureDate: q.get('departureDate') || undefined,
      oneWay: parseBoolean(q.get('oneWay')),
      duration: q.get('duration') || undefined,
      nonStop: parseBoolean(q.get('nonStop')),
      maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
      viewBy: (q.get('viewBy') as any) || undefined,
      currencyCode: q.get('currencyCode') || undefined
    };
    const parsed = inspirationQuerySchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError('Invalid query', parsed.error.flatten());
    }
    const service = createDefaultInspirationService();
    const result = await service.search(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpResponse(err);
    return NextResponse.json(body, { status });
  }
}


