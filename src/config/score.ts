export interface ScoreWeights {
	priceVsMedian: number;
	durationPenalty: number;
	stopPenalty: number;
	layoverQuality: number;
	baggageValue: number;
	confidence: number;
}

export const defaultScoreWeights: ScoreWeights = {
	priceVsMedian: 0.45,
	durationPenalty: 0.15,
	stopPenalty: 0.15,
	layoverQuality: 0.1,
	baggageValue: 0.05,
	confidence: 0.1
};

export function normalizeWeights(weights: ScoreWeights): ScoreWeights {
	const sum = Object.values(weights).reduce((a, b) => a + b, 0);
	if (sum <= 0) return defaultScoreWeights;
	return {
		priceVsMedian: weights.priceVsMedian / sum,
		durationPenalty: weights.durationPenalty / sum,
		stopPenalty: weights.stopPenalty / sum,
		layoverQuality: weights.layoverQuality / sum,
		baggageValue: weights.baggageValue / sum,
		confidence: weights.confidence / sum
	};
}


