import { NextRequest, NextResponse } from 'next/server';
import { createDefaultCheapestDatesService } from '../../../src/services/CheapestDatesService';
import { toHttpResponse, ValidationError } from '../../../src/domain/errors';
import { cheapestDatesQuerySchema } from '../../../src/domain/validation';

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
    const destination = q.get('destination');
    const departureDate = q.get('departureDate');
    if (!origin || !destination || !departureDate) {
      throw new ValidationError('origin, destination and departureDate are required');
    }
    const params = {
      origin,
      destination,
      departureDate,
      returnDate: q.get('returnDate') || undefined,
      oneWay: parseBoolean(q.get('oneWay')),
      duration: q.get('duration') || undefined,
      nonStop: parseBoolean(q.get('nonStop')),
      viewBy: q.get('viewBy') || undefined,
      currencyCode: q.get('currencyCode') || undefined
    };
    const parsed = cheapestDatesQuerySchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError('Invalid query', parsed.error.flatten());
    }
    const service = createDefaultCheapestDatesService();
    const result = await service.search(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpResponse(err);
    return NextResponse.json(body, { status });
  }
}


