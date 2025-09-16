import { Offer, SearchParams } from '../domain/types';
import { AdvancedSearchRequest } from './contracts';

export interface SearchProvider {
	name: string;
	search(params: SearchParams): Promise<Offer[]>;
	searchAdvanced?(body: AdvancedSearchRequest): Promise<Offer[]>;
}


