import Alert from '../../../src/frontend/components/ui/Alert';
import SectionHeader from '../../../src/frontend/components/composite/SectionHeader';

export default function LearnDealsPage() {
  return (
    <main className="container">
      <SectionHeader title="AI Deal Score" subtitle="What affects the score" />
      <Alert tone="warning" title="Price ranges vary" body="Historical ranges and buy/wait are probabilistic, not guarantees." />
    </main>
  );
}


