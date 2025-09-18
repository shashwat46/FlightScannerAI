export type IataCode = string;

export type IsoDateString = string;

export type CurrencyCode = string;

export type ProviderName = 'mock' | 'kiwi' | string;

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface PassengerCounts {
	adults: number;
	children?: number;
	infants?: number;
}

export interface SearchParams {
	origin: IataCode;
	destination?: IataCode; // Omit for anywhere searches
	departDate: IsoDateString; // YYYY-MM-DD
	returnDate?: IsoDateString; // YYYY-MM-DD if round-trip
	oneWay?: boolean;
	passengers: PassengerCounts;
	cabin?: CabinClass;
	currency?: CurrencyCode;
	includeScore?: boolean;
	maxStops?: number;
	sortBy?: 'price' | 'score' | 'duration';
}

export interface MoneyAmount {
	amount: number;
	currency: CurrencyCode;
}

export interface BaggageAllowance {
	carryOn?: string; // e.g., "1 x 8kg"
	checked?: string; // e.g., "1 x 23kg"
}

export interface Segment {
	origin: IataCode;
	destination: IataCode;
	departureTimeUtc: string; // ISO timestamp
	arrivalTimeUtc: string; // ISO timestamp
	departureTerminal?: string;
	arrivalTerminal?: string;
	marketingCarrier: string; // e.g., "AA"
	operatingCarrier?: string;
	flightNumber: string; // e.g., "AA123"
	aircraft?: string; // e.g., "32N"
	durationMinutes: number;
	cabin?: CabinClass;
	fareClass?: string;
}

export interface Itinerary {
	segments: Segment[];
	durationMinutes: number;
	stops: number;
}

export interface Offer {
	id: string;
	provider: ProviderName;
	outbound: Itinerary;
	inbound?: Itinerary; // if round trip
	price: MoneyAmount;
	cabin: CabinClass;
	fareBrand?: string; // e.g., Basic, Standard, Flex
	baggage?: BaggageAllowance;
	bookingUrl?: string;
	extras?: {
		numberOfBookableSeats?: number;
		validatingAirlineCodes?: string[];
		includedCheckedBagsOnly?: boolean;
		priceBase?: number;
		taxes?: number;
		fareBrand?: string;
		fareBrandLabel?: string;
		mealIncluded?: boolean;
		mealChargeable?: boolean;
		refundable?: boolean;
		changeable?: boolean;
		fareClass?: string;
		outboundLayoverMinutes?: number;
		inboundLayoverMinutes?: number;
		departureTimeUtc?: string;
		arrivalTimeUtc?: string;
	};
}

export interface ScoreBreakdown {
	priceVsMedian: number; // -100..+100
	durationPenalty: number; // 0..100
	stopPenalty: number; // 0..100
	layoverQuality: number; // 0..100
	baggageValue: number; // 0..100
	confidence: number; // 0..1
	notes?: string[];
}

export interface ScoredOffer extends Offer {
	score: number; // 0..100
	breakdown: ScoreBreakdown;
}

export interface BaselineStats {
	medianPrice: number;
	volatility: number; // e.g., stddev or MAD
	sampleSize: number;
	lastUpdatedUtc: string;
}

export interface Snapshot {
	routeKey: string; // e.g., "LAX->NRT"
	departDate: IsoDateString;
	cabin: CabinClass;
	priceAmount: number;
	currency: CurrencyCode;
	provider: ProviderName;
	capturedAtUtc: string; // ISO timestamp
}

export interface SearchResult {
	offers: Offer[] | ScoredOffer[];
	count: number;
	currency: CurrencyCode;
	provider: ProviderName;
}


