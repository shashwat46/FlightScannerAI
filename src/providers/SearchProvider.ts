import { Offer, SearchParams } from '../domain/types';

export interface SearchProvider {
	name: string;
	search(params: SearchParams): Promise<Offer[]>;
}


