import { BaggageAllowance, Offer, Segment } from '../../domain/types';

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
		departureTerminal: s?.departure?.terminal,
		arrivalTerminal: s?.arrival?.terminal,
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
		const secondItin = o?.itineraries?.[1];
		const segs2 = secondItin ? mapSegments(secondItin?.segments || [], o?.dictionaries) : undefined;
		const outboundDuration = minutesFromIsoDuration(firstItin?.duration) || segs.reduce((a, b) => a + b.durationMinutes, 0);
		const inboundDuration = secondItin ? minutesFromIsoDuration(secondItin?.duration) || (segs2 || []).reduce((a, b) => a + b.durationMinutes, 0) : undefined;
		const priceAmount = Number(o?.price?.grandTotal || o?.price?.total || 0);
		const currency = o?.price?.currency || defaultCurrency;

		const includedBagsOnly = Boolean(o?.pricingOptions?.includedCheckedBagsOnly);
		const numberOfBookableSeats = Number(o?.numberOfBookableSeats || 0) || undefined;
		const validatingAirlineCodes = Array.isArray(o?.validatingAirlineCodes) ? o.validatingAirlineCodes : undefined;
		const priceBase = o?.price?.base ? Number(o.price.base) : undefined;
		const taxes = priceBase != null ? Math.max(0, Number(o?.price?.grandTotal || o?.price?.total || 0) - priceBase) : undefined;
		const outboundLayover = calcLayoverMinutes(segs);
		const inboundLayover = segs2 ? calcLayoverMinutes(segs2) : undefined;
		const firstSeg = segs[0];
		const lastSegOut = segs[segs.length - 1];

		const baggage = aggregateBaggage(o);
		const fareMeta = aggregateFareMeta(o);

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
			inbound: segs2 && inboundDuration != null ? { segments: segs2, durationMinutes: inboundDuration, stops: Math.max(0, segs2.length - 1) } : undefined,
            extras: {
				numberOfBookableSeats,
				validatingAirlineCodes,
				includedCheckedBagsOnly: includedBagsOnly,
				priceBase,
				taxes,
                outboundLayoverMinutes: outboundLayover,
                inboundLayoverMinutes: inboundLayover,
                departureTimeUtc: firstSeg?.departureTimeUtc,
                arrivalTimeUtc: lastSegOut?.arrivalTimeUtc,
                fareBrand: fareMeta.fareBrand,
                fareBrandLabel: fareMeta.fareBrandLabel,
                mealIncluded: fareMeta.mealIncluded,
                mealChargeable: fareMeta.mealChargeable,
                refundable: fareMeta.refundable,
                changeable: fareMeta.changeable,
                fareClass: fareMeta.fareClass
			},
			baggage
		};
	};
}

function calcLayoverMinutes(segments: Segment[]): number | undefined {
    if (segments.length < 2) return undefined;
    let total = 0;
    for (let i = 0; i < segments.length - 1; i++) {
        const a = new Date(segments[i].arrivalTimeUtc).getTime();
        const b = new Date(segments[i + 1].departureTimeUtc).getTime();
        if (!isNaN(a) && !isNaN(b) && b > a) total += (b - a) / 60000;
    }
    return total || undefined;
}

function aggregateBaggage(o: any): BaggageAllowance | undefined {
	const tps = Array.isArray(o?.travelerPricings) ? o.travelerPricings : [];
	let checkedWeight: number | undefined;
	let cabinWeight: number | undefined;
	for (const tp of tps) {
		for (const fd of tp?.fareDetailsBySegment || []) {
			const cb = fd?.includedCheckedBags;
			if (cb?.weight) {
				checkedWeight = Math.max(checkedWeight || 0, Number(cb.weight));
			}
			const kb = fd?.includedCabinBags;
			if (kb?.weight) {
				cabinWeight = Math.max(cabinWeight || 0, Number(kb.weight));
			}
		}
	}
	const baggage: BaggageAllowance = {} as BaggageAllowance;
	if (typeof cabinWeight === 'number') (baggage as any).carryOn = `1 x ${cabinWeight}kg`;
	if (typeof checkedWeight === 'number') (baggage as any).checked = `1 x ${checkedWeight}kg`;
	return (baggage as any).carryOn || (baggage as any).checked ? baggage : undefined;
}

function aggregateFareMeta(o: any): { fareBrand?: string; fareBrandLabel?: string; mealIncluded?: boolean; mealChargeable?: boolean; refundable?: boolean; changeable?: boolean; fareClass?: string } {
    const meta: { fareBrand?: string; fareBrandLabel?: string; mealIncluded?: boolean; mealChargeable?: boolean; refundable?: boolean; changeable?: boolean; fareClass?: string } = {} as any;
	const tps = Array.isArray(o?.travelerPricings) ? o.travelerPricings : [];
	for (const tp of tps) {
		for (const fd of tp?.fareDetailsBySegment || []) {
			if (!meta.fareBrand && fd?.brandedFare) meta.fareBrand = fd.brandedFare;
			if (!meta.fareBrandLabel && fd?.brandedFareLabel) meta.fareBrandLabel = fd.brandedFareLabel;
            if (!meta.fareClass && fd?.class) meta.fareClass = fd.class;
			for (const am of fd?.amenities || []) {
				const desc = String(am?.description || '').toUpperCase();
                if (desc.includes('MEAL')) {
                    if (am.isChargeable === false) meta.mealIncluded = true;
                    if (am.isChargeable === true) meta.mealChargeable = true;
                }
				if (desc.includes('REFUNDABLE')) meta.refundable = meta.refundable ?? !am.isChargeable;
				if (desc.includes('CHANGEABLE')) meta.changeable = meta.changeable ?? !am.isChargeable;
			}
		}
	}
	return meta;
}


