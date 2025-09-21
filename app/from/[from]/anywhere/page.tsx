import { getJson } from 'src/frontend/lib/api';
import { headers } from 'next/headers';
import ResultsHeader from 'src/frontend/components/composite/ResultsHeader';
import SectionHeader from 'src/frontend/components/composite/SectionHeader';
import DealRow from 'src/frontend/components/composite/DealRow';
import List from 'src/frontend/components/ui/List';
import LoadingHandler from './LoadingHandler';
import ScrollRestorer from 'src/frontend/components/ui/ScrollRestorer';

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
    <div style={{ minHeight: '100vh' }}>
      <ScrollRestorer id={`anywhere-${origin}`} />
      <LoadingHandler hasData={hasData} />
      <ResultsHeader />
      
      <main className="container" style={{ 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-2xl)',
        background: 'var(--color-bg)'
      }}>
        <SectionHeader title="Results" subtitle="Sorted by AI Deal Score" />
        <List items={rows as any} ItemComponent={DealRow as any} />
      </main>
    </div>
  );
}


