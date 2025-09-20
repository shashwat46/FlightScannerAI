import React from 'react';
import Link from 'next/link';
import { UiDealRow } from '../../../schemas/viewModels';
import styles from './styles.module.css';

export default function DealRow(props: UiDealRow & { index: number; href?: string }) {
  const { destination, pricing, aiDealScore, month, dealId, href } = props as any;
  const content = (
    <div className={styles['deal-row']}>
      <div className={styles['deal-row__header']}>
        <div className={styles['deal-row__title']}>{destination}</div>
        {typeof aiDealScore === 'number' && <div className={styles['deal-row__score']}>{aiDealScore}%</div>}
      </div>
      <div className={styles['deal-row__meta']}>{month}</div>
      <div className={styles['deal-row__price']}>${pricing.dealPrice}</div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return dealId ? <Link href={`/deal/${encodeURIComponent(dealId)}`}>{content}</Link> : content;
}


