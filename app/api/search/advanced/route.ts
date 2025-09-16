import { NextRequest, NextResponse } from 'next/server';
import { createDefaultSearchService } from '../../../../src/services/SearchService';
import { toHttpResponse, ValidationError } from '../../../../src/domain/errors';
import { advancedSearchBodySchema } from '../../../../src/domain/validation';

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json();
		const parsed = advancedSearchBodySchema.safeParse(body);
		if (!parsed.success) {
			throw new ValidationError('Invalid body', parsed.error.flatten());
		}
		const includeScore = String(new URL(req.url).searchParams.get('includeScore') || '')
			.toLowerCase()
			.trim() === 'true';
		const service = createDefaultSearchService();
		const result = await service.searchAdvanced(parsed.data, includeScore);
		return NextResponse.json(result, { status: 200 });
	} catch (err) {
		const { status, body } = toHttpResponse(err);
		return NextResponse.json(body, { status });
	}
}


