import React from 'react';

interface Props { title?: string; subtitle?: string; children?: React.ReactNode }

export default function SectionHeader({ title, subtitle, children }: Props) {
  return (
    <header style={{ 
      margin: '16px 0 8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        {title && <h2 style={{ margin: 0 }}>{title}</h2>}
        {subtitle && <p style={{ margin: '4px 0', color: 'var(--color-muted)' }}>{subtitle}</p>}
      </div>
      {children && <div>{children}</div>}
    </header>
  );
}


