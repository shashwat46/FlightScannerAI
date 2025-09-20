import { getJson } from 'src/frontend/lib/api';
import { headers } from 'next/headers';
import SectionHeader from 'src/frontend/components/composite/SectionHeader';
import FilterBar from 'src/frontend/components/composite/FilterBar';
import DealRow from 'src/frontend/components/composite/DealRow';
import List from 'src/frontend/components/ui/List';
import LoadingHandler from './LoadingHandler';

interface InspirationResponse { items: Array<{ origin: string; destination: string; departureDate?: string; priceTotal: number }>; currency?: string }

export default async function AnywherePage({ params, searchParams }: { params: { from: string }; searchParams: Record<string, string> }) {
  const origin = params.from.toUpperCase();
  const departDate = searchParams.departDate || new Date().toISOString().slice(0, 10);
  const query = new URLSearchParams({ origin, departureDate: departDate, currencyCode: 'USD' });
  const host = headers().get('host');
  const protocol = process.env.VERCEL ? 'https' : 'http';
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : '');
  const data = await getJson<InspirationResponse>(`${base}/api/inspiration?${query.toString()}`).catch(() => ({ items: [] }) as InspirationResponse);

  const rows = (data.items || []).map((d) => ({ destination: d.destination, pricing: { dealPrice: d.priceTotal, currency: data.currency || 'USD' }, href: `/from/${origin}/to/${d.destination}?departDate=${encodeURIComponent(d.departureDate || departDate)}` }));
  const hasData = rows.length > 0;
  
  return (
    <main className="container page-bg">
      <LoadingHandler hasData={hasData} />
      <FilterBar />
      <SectionHeader title="Results" subtitle="Sorted by AI Deal Score" />
      <List items={rows as any} ItemComponent={DealRow as any} />
    </main>
  );
}


