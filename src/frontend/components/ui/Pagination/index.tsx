import Link from 'next/link';

interface Props {
  page: number;
  totalPages: number;
  makeHref: (p: number) => string;
}

export default function Pagination({ page, totalPages, makeHref }: Props) {
  if (totalPages <= 1) return null;
  const clamped = Math.max(1, Math.min(page, totalPages));
  const pages: number[] = [];
  const start = Math.max(1, clamped - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <nav aria-label="Pagination" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
      <PageLink disabled={clamped === 1} href={makeHref(clamped - 1)}>Prev</PageLink>
      {start > 1 && <Ellipsis />}
      {pages.map((p) => (
        <PageLink key={p} href={makeHref(p)} active={p === clamped}>{p}</PageLink>
      ))}
      {end < totalPages && <Ellipsis />}
      <PageLink disabled={clamped === totalPages} href={makeHref(clamped + 1)}>Next</PageLink>
    </nav>
  );
}

function PageLink({ href, children, active, disabled }: { href: string; children: any; active?: boolean; disabled?: boolean }) {
  const common: any = { style: { padding: '8px 12px', borderRadius: 999, fontWeight: 800, border: '1px solid #c7e2f6', color: '#0b4a6f', background: '#f0f7fd' } };
  if (disabled) return <span {...common} style={{ ...common.style, opacity: 0.5 }}>{children}</span>;
  if (active) return <span {...common} style={{ ...common.style, background: '#cae9ff', borderColor: '#a7d8ff', color: '#064e73' }}>{children}</span>;
  return (
    <Link href={href} {...common}>
      {children}
    </Link>
  );
}

function Ellipsis() {
  return <span style={{ padding: '8px 6px', color: '#94a3b8' }}>…</span>;
}


