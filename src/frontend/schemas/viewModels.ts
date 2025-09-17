export type TripType = 'one_way' | 'round_trip';

export interface UiRoute {
  tripType: TripType;
  from: { iata: string; city?: string };
  to: { iata?: string; city?: string; airport?: string };
}

export interface UiPricing {
  dealPrice: number;
  regularPrice?: number;
  priceDiff?: number;
  discountPct?: number;
  currency?: string;
}

export interface UiFlightInfo {
  airline?: { name?: string; reputationScore?: number; carrierCode?: string };
  stops: number;
  isDirect: boolean;
  durationMinutes?: number;
}

export interface UiPriceHistory {
  current?: number;
  low?: number;
  high?: number;
  sparkline?: number[];
  note?: string;
}

export interface UiCheckoutSuggestion {
  buyProbability?: number;
  waitProbability?: number;
  message?: string;
}

export interface UiDeal {
  dealId: string;
  aiDealScore?: number;
  route: UiRoute;
  dates: { depart?: string; arrive?: string; return?: string | null };
  flight: UiFlightInfo;
  pricing: UiPricing;
  badges?: { type: string; label: string }[];
  insights?: { positives: string[]; warnings: string[] };
  priceHistory?: UiPriceHistory;
  checkoutSuggestion?: UiCheckoutSuggestion;
  cta?: { primary: { label: string; action: 'deeplink'; deeplinkKey?: string; provider?: string; deeplinkUrl?: string } };
  extras?: any;
  breakdown?: any;
}

export interface UiDealRow {
  dealId?: string;
  destination: string;
  aiDealScore?: number;
  month?: string;
  pricing: UiPricing;
  priceHistory?: Pick<UiPriceHistory, 'current' | 'low' | 'high'>;
  checkoutSuggestion?: Pick<UiCheckoutSuggestion, 'buyProbability'>;
  badges?: string[];
}


