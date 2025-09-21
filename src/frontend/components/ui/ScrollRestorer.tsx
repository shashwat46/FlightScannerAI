'use client';
import { useEffect } from 'react';

interface Props { id: string; }

export default function ScrollRestorer({ id }: Props) {
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll:${id}`);
    if (saved) {
      window.scrollTo(0, Number(saved));
    }
    const onUnload = () => {
      sessionStorage.setItem(`scroll:${id}`, String(window.scrollY));
    };
    window.addEventListener('pagehide', onUnload);
    return () => window.removeEventListener('pagehide', onUnload);
  }, [id]);
  return null;
}
