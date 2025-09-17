import SectionHeader from '../src/frontend/components/composite/SectionHeader';
import FilterBar from '../src/frontend/components/composite/FilterBar';
import DealRow from '../src/frontend/components/composite/DealRow';
import List from '../src/frontend/components/ui/List';

const MOCK_TOP_PICKS = [
    { destination: 'Tokyo, Japan', aiDealScore: 94, month: 'September, 2025', pricing: { dealPrice: 275, regularPrice: 820, priceDiff: -545, discountPct: 0.66, currency: 'USD' } },
    { destination: 'Lisbon, Portugal', aiDealScore: 92, month: 'October, 2025', pricing: { dealPrice: 256, regularPrice: 820, priceDiff: -564, discountPct: 0.69, currency: 'USD' } },
    { destination: 'Bangkok, Thailand', aiDealScore: 91, month: 'September, 2025', pricing: { dealPrice: 306, regularPrice: 875, priceDiff: -569, discountPct: 0.65, currency: 'USD' } }
];

export default function HomePage() {
    return (
        <main className="container page-bg">
            <FilterBar />
            <SectionHeader title="Top picks" subtitle="Based on AI Deal Score" />
            <List items={MOCK_TOP_PICKS as any} ItemComponent={DealRow as any} />
        </main>
    );
}


