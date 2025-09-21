'use client';
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [startTs, setStartTs] = useState<number | null>(null);

  const MIN_SPINNER_MS = 400; // ensures loader is visible long enough for smoothness

  const startLoading = () => {
    setStartTs(Date.now());
    setIsLoading(true);
  };

  const stopLoading = () => {
    if (!isLoading) return;
    const elapsed = startTs ? Date.now() - startTs : MIN_SPINNER_MS;
    const wait = elapsed < MIN_SPINNER_MS ? MIN_SPINNER_MS - elapsed : 0;
    if (wait === 0) {
      setIsLoading(false);
    } else {
      setTimeout(() => setIsLoading(false), wait);
    }
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setIsLoading,
      startLoading,
      stopLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
