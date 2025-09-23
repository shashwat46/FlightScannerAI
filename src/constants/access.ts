export const PUBLIC_PAGES: readonly string[] = [
  '/',
  '/from',            // prefix match for /from/[from]/to/... and /from/[from]/anywhere
  '/learn'
]

export const PUBLIC_API: readonly string[] = [
  '/api/search',
  '/api/inspiration',
  '/api/dates'
]

export const PROTECTED_PAGES: readonly string[] = [
  '/deal',            // prefix match /deal/[dealId]
  '/profile'
]

export const PROTECTED_API: readonly string[] = [
  '/api/narrative',
  '/api/booking-options',
  '/api/price-metrics',
  '/api/pricing'
]
