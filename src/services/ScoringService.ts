import { BaselineStats, Offer, ScoredOffer, ScoreBreakdown } from '../domain/types';
import { defaultScoreWeights, normalizeWeights, ScoreWeights } from '../config/score';
import { airlineRating, airportRating } from '../lib/quality';

export interface ScoringPreferences {
	weights?: Partial<ScoreWeights>;
}

export interface ScoringInput {
	offer: Offer;
	baseline?: BaselineStats;
	prefs?: ScoringPreferences;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function computePriceVsMedian(offer: Offer, baseline?: BaselineStats): number {
	if (!baseline) return 50; // neutral when no baseline
	const diff = baseline.medianPrice - offer.price.amount;
	const pct = diff / Math.max(1, baseline.medianPrice);
	return clamp(50 + pct * 100, 0, 100);
}

function computeDurationPenalty(totalMinutes: number): number {
	const ideal = 360; // 6h
	const over = Math.max(0, totalMinutes - ideal);
	const penalty = Math.min(100, over / 6); // ~1 point per 6min over ideal
	return 100 - penalty;
}

function computeStopPenalty(stops: number): number {
	if (stops <= 0) return 100;
	if (stops === 1) return 80;
	return 60;
}

function computeLayoverQuality(stops: number): number {
	if (stops <= 0) return 100;
	if (stops === 1) return 85;
	return 70;
}

function computeBaggageValue(hasChecked: boolean): number {
	return hasChecked ? 100 : 80;
}

function computeConfidence(baseline?: BaselineStats): number {
	if (!baseline) return 0.5;
	const recency = 1; // placeholder for now
	const sizeFactor = Math.min(1, baseline.sampleSize / 50);
	return clamp(0.3 + 0.7 * Math.min(recency, sizeFactor), 0, 1);
}

export function scoreOffer(input: ScoringInput): ScoredOffer {
	const { offer, baseline, prefs } = input;
	const weights = normalizeWeights({ ...defaultScoreWeights, ...prefs?.weights });

	const totalMinutes = offer.outbound.durationMinutes + (offer.inbound?.durationMinutes || 0);
	const stops = offer.outbound.stops + (offer.inbound?.stops || 0);
	const hasChecked = Boolean(offer.baggage?.checked);

	const priceVsMedian = computePriceVsMedian(offer, baseline);
	const durationPenalty = computeDurationPenalty(totalMinutes);
	const stopPenalty = computeStopPenalty(stops);
	const layoverQuality = computeLayoverQuality(stops);
	const baggageValue = computeBaggageValue(hasChecked);
	const airlineQuality = 100;
	const airportQuality = 100;
	const confidence = computeConfidence(baseline);

	const breakdown: ScoreBreakdown = {
		priceVsMedian,
		durationPenalty,
		stopPenalty,
		layoverQuality,
		baggageValue,
		airlineQuality,
		airportQuality,
		confidence,
		notes: []
	};

	const score = clamp(
		Math.round(
			priceVsMedian * weights.priceVsMedian +
			durationPenalty * weights.durationPenalty +
			stopPenalty * weights.stopPenalty +
			layoverQuality * weights.layoverQuality +
			baggageValue * weights.baggageValue +
			airlineQuality * weights.airlineQuality +
			airportQuality * weights.airportQuality +
			confidence * 100 * weights.confidence
		),
		0,
		100
	);

	return { ...offer, score, breakdown };
}

export async function scoreOfferAsync(input: ScoringInput): Promise<ScoredOffer> {
    const { offer, baseline, prefs } = input;
    const weights = normalizeWeights({ ...defaultScoreWeights, ...prefs?.weights });

    const totalMinutes = offer.outbound.durationMinutes + (offer.inbound?.durationMinutes || 0);
    const stops = offer.outbound.stops + (offer.inbound?.stops || 0);
    const hasChecked = Boolean(offer.baggage?.checked);

    const [airRating, originRating, destRating] = await Promise.all([
        airlineRating(offer.outbound.segments[0].marketingCarrier),
        airportRating(offer.outbound.segments[0].origin),
        airportRating(offer.outbound.segments.at(-1)!.destination)
    ]);

    const priceVsMedian = computePriceVsMedian(offer, baseline);
    const durationPenalty = computeDurationPenalty(totalMinutes);
    const stopPenalty = computeStopPenalty(stops);
    const layoverQuality = computeLayoverQuality(stops);
    const baggageValue = computeBaggageValue(hasChecked);
    const airlineQuality = airRating * 20; // 1-5 -> 20-100
    const airportQuality = Math.min(originRating, destRating) * 20;
    const confidence = computeConfidence(baseline);

    const breakdown: ScoreBreakdown = {
        priceVsMedian,
        durationPenalty,
        stopPenalty,
        layoverQuality,
        baggageValue,
        airlineQuality,
        airportQuality,
        confidence,
        airlineRating: airRating,
        originAirportRating: originRating,
        destAirportRating: destRating,
        notes: []
    };

    const score = clamp(
        Math.round(
            priceVsMedian * weights.priceVsMedian +
            durationPenalty * weights.durationPenalty +
            stopPenalty * weights.stopPenalty +
            layoverQuality * weights.layoverQuality +
            baggageValue * weights.baggageValue +
            airlineQuality * weights.airlineQuality +
            airportQuality * weights.airportQuality +
            confidence * 100 * weights.confidence
        ),
        0,
        100
    );

    return { ...offer, score, breakdown };
}


