'use client';
import React from 'react';
import { useLoading } from '../../../contexts/LoadingContext';
import LoadingScreen from '../LoadingScreen';

export default function GlobalLoadingScreen() {
  const { isLoading } = useLoading();
  
  return <LoadingScreen isVisible={isLoading} />;
}
