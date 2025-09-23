"use client";
import { usePathname } from 'next/navigation';
import Header from '../Header';

export default function ConditionalHeader() {
  'use client';
  const pathname = usePathname();
  const isDetailPage = pathname?.startsWith('/deal/');
  if (!isDetailPage) return null;
  return <Header />;
}
