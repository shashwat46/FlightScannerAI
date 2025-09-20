"use client";
import { usePathname } from 'next/navigation';
import Header from '../Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isDetailPage = pathname?.includes('/deal/');
  const isHomePage = pathname === '/';
  
  // Don't render header on detail pages (they render their own) or homepage
  if (isDetailPage || isHomePage) {
    return null;
  }
  
  return <Header />;
}
