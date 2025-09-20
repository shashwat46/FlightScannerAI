import { NextRequest, NextResponse } from 'next/server';
import { createDefaultSearchService } from '../../../src/services/SearchService';
import { ValidationError, toHttpResponse } from '../../../src/domain/errors';
import { CabinClass, PassengerCounts, SearchParams } from '../../../src/domain/types';
import { SearchService } from '../../../src/services/SearchService';
import { AmadeusProvider } from '../../../src/providers/amadeus/AmadeusProvider';
import { GoogleFlightsProvider } from '../../../src/providers/serpapi/GoogleFlightsProvider';
import { searchQuerySchema } from '../../../src/domain/validation';

function parseBoolean(value: string | null): boolean | undefined {
	if (value === null) return undefined;
	const v = value.toLowerCase();
	return v === 'true' || v === '1';
}

function parsePassengers(value: string | null): PassengerCounts | undefined {
	if (!value) return undefined;
	try {
		const obj = JSON.parse(value) as PassengerCounts;
		if (typeof obj.adults !== 'number' || obj.adults <= 0) return undefined;
		return obj;
	} catch {
		return undefined;
	}
}

function parseParams(req: NextRequest): SearchParams {
	const url = new URL(req.url);
	const q = url.searchParams;

	const origin = q.get('origin');
	const departDate = q.get('departDate');
	if (!origin || !departDate) {
		throw new ValidationError('origin and departDate are required');
	}

	const destination = q.get('destination') || undefined;
	const returnDate = q.get('returnDate') || undefined;
    const oneWay = parseBoolean(q.get('oneWay'));
	const currency = q.get('currency') || undefined;
	const includeScore = parseBoolean(q.get('includeScore'));
    const maxStops = q.get('maxStops') ? Number(q.get('maxStops')) : undefined;
	const sortBy = (q.get('sortBy') as 'price' | 'score' | 'duration') || undefined;
	const cabin = (q.get('cabin') as CabinClass) || undefined;

	const passengers = parsePassengers(q.get('passengers')) || { adults: 1 };

	return {
		origin,
		destination,
		departDate,
		returnDate,
		oneWay,
		passengers,
		cabin,
		currency,
		includeScore,
		maxStops,
		sortBy
	};
}

export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const parsed = searchQuerySchema.safeParse(parseParams(req));
		if (!parsed.success) {
			throw new ValidationError('Invalid query', parsed.error.flatten());
		}
        const params = parsed.data as SearchParams;
        const url = new URL(req.url);
        const source = (url.searchParams.get('source') || '').trim().toLowerCase();
        let service: SearchService;
        if (source === 'amadeus') service = new SearchService(new AmadeusProvider());
        else if (source === 'serpapi') service = new SearchService(new GoogleFlightsProvider());
        else service = createDefaultSearchService();
		const result = await service.search(params);
		return NextResponse.json(result, { status: 200 });
	} catch (err) {
		const { status, body } = toHttpResponse(err);
		return NextResponse.json(body, { status });
	}
}


