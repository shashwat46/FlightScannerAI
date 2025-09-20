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
        <div>
            {/* Premium Hero Section */}
            <section style={{ 
                background: 'var(--color-header)', 
                color: 'white',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop: 'var(--space-2xl)',
                paddingBottom: 'var(--space-2xl)'
            }}>
                <div className="container">
                    {/* Logo and Tagline */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-lg)', 
                        marginBottom: 'var(--space-2xl)' 
                    }}>
                        <img 
                            src="/logo.svg" 
                            alt="Wingman AI" 
                            style={{ 
                                width: '48px', 
                                height: '48px',
                                filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4)) contrast(1.2) brightness(1.1)'
                            }} 
                        />
                        <div>
                            <h1 style={{ 
                                fontSize: '28px', 
                                fontWeight: 700, 
                                margin: 0,
                                letterSpacing: '-0.025em'
                            }}>
                                Wingman AI
                            </h1>
                        </div>
                    </div>

                    {/* Main Tagline */}
                    <div style={{ marginBottom: 'var(--space-2xl)' }}>
                        <h2 style={{ 
                            fontSize: '36px', 
                            fontWeight: 700, 
                            margin: 0,
                            lineHeight: 1.2,
                            letterSpacing: '-0.025em',
                            maxWidth: '600px'
                        }}>
                            AI-powered flight deals. One intelligent search.
                        </h2>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ maxWidth: '1000px' }}>
                        <FilterBar />
                    </div>
                </div>
            </section>

            {/* Top Picks Section */}
            <main className="container" style={{ 
                paddingTop: 'var(--space-2xl)', 
                paddingBottom: 'var(--space-2xl)',
                background: 'var(--color-bg)'
            }}>
                <SectionHeader title="Top picks" subtitle="Based on AI Deal Score" />
                <List items={MOCK_TOP_PICKS as any} ItemComponent={DealRow as any} />
            </main>
        </div>
    );
}


