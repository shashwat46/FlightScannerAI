'use client';
import { useEffect } from 'react';
import { useLoading } from '../../../../src/frontend/contexts/LoadingContext';

interface LoadingHandlerProps {
  hasData: boolean;
}

export default function LoadingHandler({ hasData }: LoadingHandlerProps) {
  const { stopLoading } = useLoading();

  useEffect(() => {
    if (hasData) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        stopLoading();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasData, stopLoading]);

  return null;
}
