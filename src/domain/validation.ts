import { z } from 'zod';

export const iataCodeSchema = z.string().min(3).max(3);
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const cabinSchema = z.enum(['economy', 'premium_economy', 'business', 'first']).optional();

export const passengersSchema = z
	.object({
		adults: z.number().int().min(1),
		children: z.number().int().min(0).optional(),
		infants: z.number().int().min(0).optional()
	})
	.strict();

export const searchQuerySchema = z.object({
	origin: iataCodeSchema,
	destination: iataCodeSchema.optional(),
	departDate: isoDateSchema,
	returnDate: isoDateSchema.optional(),
	oneWay: z.boolean().optional(),
	passengers: passengersSchema.optional(),
	cabin: cabinSchema,
	currency: z.string().length(3).optional(),
	includeScore: z.boolean().optional(),
	maxStops: z.number().int().min(0).optional(),
	sortBy: z.enum(['price', 'score', 'duration']).optional()
});

export const advancedSearchBodySchema = z
	.object({
		currencyCode: z.string().length(3).optional(),
		originDestinations: z
			.array(
				z.object({
					id: z.string(),
					originLocationCode: iataCodeSchema,
					destinationLocationCode: iataCodeSchema,
					departureDateTimeRange: z.object({ date: isoDateSchema.optional(), time: z.string().optional() }).optional()
				})
			)
			.min(1),
		travelers: z.array(z.object({ id: z.string(), travelerType: z.string() })).min(1),
		sources: z.array(z.string()).optional(),
		searchCriteria: z
			.object({
				maxFlightOffers: z.number().int().min(1).optional(),
				flightFilters: z
					.object({
						cabinRestrictions: z
							.array(
								z.object({
									cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
									coverage: z.string().optional(),
									originDestinationIds: z.array(z.string()).optional()
								})
							)
							.optional()
					})
					.optional()
			})
			.optional()
	})
	.strict();


