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


