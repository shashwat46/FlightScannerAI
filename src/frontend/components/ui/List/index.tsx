import React from 'react';

interface ListProps<T> {
  items: T[];
  ItemComponent: React.ComponentType<T & { index: number }>;
  empty?: React.ReactNode;
  loading?: boolean;
  skeleton?: React.ReactNode;
}

export default function List<T extends object>({ items, ItemComponent, empty, loading, skeleton }: ListProps<T>) {
  if (loading) return <div>{skeleton || 'Loading...'}</div>;
  if (!items || items.length === 0) return <div>{empty || 'No items'}</div>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
      {items.map((item, index) => (
        <li key={(item as any).id || index}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <ItemComponent index={index} {...(item as any)} />
        </li>
      ))}
    </ul>
  );
}


