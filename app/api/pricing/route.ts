import { NextRequest, NextResponse } from 'next/server';
import { createDefaultPricingService } from '../../../src/services/PricingService';
// Note: SerpApi booking is handled in a dedicated booking-options endpoint.
import { priceRefsSchema, priceFlightOffersBodySchema } from '../../../src/domain/validation';
import { toHttpResponse, ValidationError } from '../../../src/domain/errors';

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json();
		const service = createDefaultPricingService();
		if (body && Array.isArray(body.offerRefs)) {
			const parsed = priceRefsSchema.safeParse(body);
			if (!parsed.success) throw new ValidationError('Invalid refs', parsed.error.flatten());
			const { offerRefs, include, forceClass } = parsed.data;
			const priced = await service.priceByRefs(offerRefs, include, forceClass);
			return NextResponse.json({ offers: priced, count: priced.length }, { status: 200 });
		}
		const parsed = priceFlightOffersBodySchema.safeParse(body);
		if (!parsed.success) throw new ValidationError('Invalid pricing body', parsed.error.flatten());
		const priced = await service.priceByBody(parsed.data as any);
		return NextResponse.json({ offers: priced, count: priced.length }, { status: 200 });
	} catch (err) {
		const { status, body } = toHttpResponse(err);
		return NextResponse.json(body, { status });
	}
}


