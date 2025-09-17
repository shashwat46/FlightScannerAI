import React from 'react';

interface Props { title?: string; subtitle?: string; infoLinkRoute?: string }

export default function SectionHeader({ title, subtitle }: Props) {
  return (
    <header style={{ margin: '16px 0 8px' }}>
      {title && <h2 style={{ margin: 0 }}>{title}</h2>}
      {subtitle && <p style={{ margin: '4px 0', color: 'var(--color-muted)' }}>{subtitle}</p>}
    </header>
  );
}


