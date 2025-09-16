import { Offer, SearchParams } from '../../domain/types';
import { SearchProvider } from '../SearchProvider';

function minutes(h: number, m = 0): number {
	return h * 60 + m;
}

export class MockProvider implements SearchProvider {
	public readonly name = 'mock';

	async search(params: SearchParams): Promise<Offer[]> {
		const currency = params.currency || 'USD';
		const cabin = params.cabin || 'economy';

		const base: Offer[] = [
			{
				id: 'mock-1',
				provider: 'mock',
				outbound: {
					segments: [
						{
							origin: params.origin,
							destination: params.destination || 'LHR',
							departureTimeUtc: `${params.departDate}T08:00:00.000Z`,
							arrivalTimeUtc: `${params.departDate}T16:30:00.000Z`,
							marketingCarrier: 'BA',
							flightNumber: 'BA280',
							durationMinutes: minutes(8, 30)
						}
					],
					durationMinutes: minutes(8, 30),
					stops: 0
				},
				price: { amount: 680, currency },
				cabin,
				fareBrand: 'Standard',
				baggage: { carryOn: '1 x 8kg', checked: '1 x 23kg' },
				bookingUrl: 'https://example.com/ba280'
			},
			{
				id: 'mock-2',
				provider: 'mock',
				outbound: {
					segments: [
						{
							origin: params.origin,
							destination: params.destination || 'CDG',
							departureTimeUtc: `${params.departDate}T07:30:00.000Z`,
							arrivalTimeUtc: `${params.departDate}T13:15:00.000Z`,
							marketingCarrier: 'AF',
							flightNumber: 'AF65',
							durationMinutes: minutes(10, 45)
						},
						{
							origin: params.destination || 'CDG',
							destination: params.destination || 'FCO',
							departureTimeUtc: `${params.departDate}T15:00:00.000Z`,
							arrivalTimeUtc: `${params.departDate}T16:55:00.000Z`,
							marketingCarrier: 'AF',
							flightNumber: 'AF1300',
							durationMinutes: minutes(1, 55)
						}
					],
					durationMinutes: minutes(12, 40),
					stops: 1
				},
				price: { amount: 520, currency },
				cabin,
				fareBrand: 'Light',
				baggage: { carryOn: '1 x 8kg' },
				bookingUrl: 'https://example.com/af65'
			}
		];

		if (params.maxStops === 0) {
			return base.filter((o) => o.outbound.stops === 0);
		}

		return base;
	}
}


