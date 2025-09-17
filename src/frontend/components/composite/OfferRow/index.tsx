import Link from 'next/link';

interface Props {
  id: string;
  carrier?: string;
  duration?: string;
  stops?: number;
  price: { amount: number; currency: string };
  href: string;
}

export default function OfferRow({ carrier, duration, stops, price, href }: Props) {
  return (
    <Link href={href} style={{ display: 'block' }}>
      <div className="u-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{carrier || 'Flight'}</div>
          <div style={{ color: 'var(--color-muted)' }}>{duration || ''} • {typeof stops === 'number' ? `${stops} stop${stops === 1 ? '' : 's'}` : ''}</div>
        </div>
        <div style={{ fontWeight: 800 }}>{price.currency} {price.amount}</div>
      </div>
    </Link>
  );
}


