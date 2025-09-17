export interface AdvancedSearchRequest {
	currencyCode?: string;
	originDestinations: Array<{
		id: string;
		originLocationCode: string;
		destinationLocationCode: string;
		departureDateTimeRange?: { date?: string; time?: string };
	}>;
	travelers: Array<{
		id: string;
		travelerType: string; // e.g., ADULT, CHILD
	}>;
	sources?: string[]; // e.g., ["GDS"]
	searchCriteria?: {
		maxFlightOffers?: number;
		flightFilters?: {
			cabinRestrictions?: Array<{
				cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
				coverage?: 'MOST_SEGMENTS' | 'AT_LEAST_ONE_SEGMENT' | string;
				originDestinationIds?: string[];
			}>;
		};
	};
}

export interface PriceFlightOffersRequest {
	data: {
		type: 'flight-offers-pricing';
		flightOffers: any[];
	};
	include?: Array<'credit-card-fees' | 'bags' | 'other-services' | 'detailed-fare-rules'>;
	forceClass?: boolean;
}

export interface CheapestDatesQuery {
    origin: string;
    destination: string;
    departureDate: string; // ISO date or range "YYYY-MM-DD,YYYY-MM-DD"
    returnDate?: string; // optional ISO date or range
    oneWay?: boolean;
    duration?: string; // e.g., "1,15"
    nonStop?: boolean;
    viewBy?: 'DATE' | 'DURATION' | 'PRICE' | string;
    currencyCode?: string;
}

export interface CheapestDateItem {
    departureDate: string;
    returnDate?: string;
    priceTotal: number;
    flightOffersLink?: string;
}

export interface CheapestDatesResult {
    provider: string;
    currency?: string;
    items: CheapestDateItem[];
    count: number;
}

export interface InspirationSearchQuery {
    origin: string;
    departureDate?: string; // ISO date or range
    oneWay?: boolean;
    duration?: string; // 1,15
    nonStop?: boolean;
    maxPrice?: number;
    viewBy?: 'COUNTRY' | 'DATE' | 'DESTINATION' | 'DURATION' | 'WEEK' | string;
    currencyCode?: string;
}

export interface InspirationItem {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
    priceTotal: number;
    links?: {
        flightDates?: string;
        flightOffers?: string;
    };
}

export interface InspirationSearchResult {
    provider: string;
    currency?: string;
    items: InspirationItem[];
    count: number;
}


