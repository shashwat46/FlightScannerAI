export function paramsFromSearch(searchParams: URLSearchParams) {
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || undefined;
  const departDate = searchParams.get('departDate') || '';
  const includeScore = (searchParams.get('includeScore') || 'true').toLowerCase() === 'true';
  const cabin = searchParams.get('cabin') || 'economy';
  const currency = searchParams.get('currency') || 'USD';
  const maxStops = searchParams.get('maxStops') ? Number(searchParams.get('maxStops')) : undefined;
  const sortBy = (searchParams.get('sortBy') as 'price' | 'score' | 'duration') || undefined;
  const passengers = (() => {
    const raw = searchParams.get('passengers');
    if (!raw) return { adults: 1 };
    try { return JSON.parse(raw); } catch { return { adults: 1 }; }
  })();
  return { origin, destination, departDate, includeScore, cabin, currency, maxStops, sortBy, passengers };
}

export function pushUrl(router: any, next: Record<string, any>) {
  const sp = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(next)) {
    if (v === undefined || v === null || v === '') sp.delete(k);
    else sp.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  router.push(`?${sp.toString()}`);
}


