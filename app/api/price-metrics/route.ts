import { NextRequest, NextResponse } from 'next/server';
import { itineraryPriceMetricsQuerySchema } from '../../../src/domain/validation';
import { createDefaultFlightPriceAnalysisService } from '../../../src/services/FlightPriceAnalysisService';
import { toHttpResponse, ValidationError } from '../../../src/domain/errors';

function parseBoolean(value: string | null): boolean | undefined {
  if (value == null) return undefined;
  const v = value.toLowerCase();
  return v === 'true' || v === '1';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const q = url.searchParams;
    const originIataCode = q.get('originIataCode');
    const destinationIataCode = q.get('destinationIataCode');
    const departureDate = q.get('departureDate');
    if (!originIataCode || !destinationIataCode || !departureDate) {
      throw new ValidationError('originIataCode, destinationIataCode and departureDate are required');
    }
    const params = {
      originIataCode,
      destinationIataCode,
      departureDate,
      currencyCode: q.get('currencyCode') || undefined,
      oneWay: parseBoolean(q.get('oneWay'))
    };
    const parsed = itineraryPriceMetricsQuerySchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError('Invalid query', parsed.error.flatten());
    }
    const service = createDefaultFlightPriceAnalysisService();
    const result = await service.getMetrics(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpResponse(err);
    return NextResponse.json(body, { status });
  }
}




