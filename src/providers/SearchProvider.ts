import { Offer, SearchParams } from '../domain/types';
import { AdvancedSearchRequest, PriceFlightOffersRequest, CheapestDatesQuery, CheapestDatesResult, InspirationSearchQuery, InspirationSearchResult } from './contracts';

export interface SearchProvider {
	name: string;
	search(params: SearchParams): Promise<Offer[]>;
	searchAdvanced?(body: AdvancedSearchRequest): Promise<Offer[]>;
	priceFlightOffers?(req: PriceFlightOffersRequest): Promise<Offer[]>;
    searchCheapestDates?(params: CheapestDatesQuery): Promise<CheapestDatesResult>;
	searchInspiration?(params: InspirationSearchQuery): Promise<InspirationSearchResult>;
}


