import { Offer, Segment } from '../../domain/types';

export function minutesFromIsoDuration(iso: string | undefined): number | null {
	if (!iso) return null;
	const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
	if (!m) return null;
	const days = Number(m[1] || 0);
	const hours = Number(m[2] || 0);
	const mins = Number(m[3] || 0);
	return days * 24 * 60 + hours * 60 + mins;
}

export function mapSegments(segments: any[], dictionaries?: any): Segment[] {
	return (segments || []).map((s: any) => ({
		origin: s?.departure?.iataCode,
		destination: s?.arrival?.iataCode,
		departureTimeUtc: s?.departure?.at,
		arrivalTimeUtc: s?.arrival?.at,
		marketingCarrier: s?.carrierCode,
		operatingCarrier: s?.operating?.carrierCode,
		flightNumber: `${s?.carrierCode}${s?.number}`,
		aircraft: s?.aircraft?.code,
		durationMinutes: minutesFromIsoDuration(s?.duration) || 0,
		cabin: undefined,
		fareClass: undefined
	}));
}

export function mapOffer(defaultCurrency: string) {
	return (o: any): Offer => {
		const firstItin = o?.itineraries?.[0];
		const segs = mapSegments(firstItin?.segments || [], o?.dictionaries);
		const outboundDuration = minutesFromIsoDuration(firstItin?.duration) || segs.reduce((a, b) => a + b.durationMinutes, 0);
		const priceAmount = Number(o?.price?.grandTotal || o?.price?.total || 0);
		const currency = o?.price?.currency || defaultCurrency;

		const includedBagsOnly = Boolean(o?.pricingOptions?.includedCheckedBagsOnly);
		const numberOfBookableSeats = Number(o?.numberOfBookableSeats || 0) || undefined;
		const validatingAirlineCodes = Array.isArray(o?.validatingAirlineCodes) ? o.validatingAirlineCodes : undefined;
		const priceBase = o?.price?.base ? Number(o.price.base) : undefined;

		return {
			id: o?.id,
			provider: 'amadeus',
			outbound: {
				segments: segs,
				durationMinutes: outboundDuration,
				stops: Math.max(0, segs.length - 1)
			},
			price: { amount: priceAmount, currency },
			cabin: 'economy',
			extras: {
				numberOfBookableSeats,
				validatingAirlineCodes,
				includedCheckedBagsOnly: includedBagsOnly,
				priceBase
			}
		};
	};
}


