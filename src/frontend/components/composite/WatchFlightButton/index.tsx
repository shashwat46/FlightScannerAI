'use client';
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from '@/src/frontend/hooks/useSession';
import { useAuthModal } from '@/src/frontend/contexts/AuthModalContext';
import styles from './styles.module.css';
import WishlistModal from '../WishlistModal';

interface Props {
  origin: string;
  destination: string;
}

export default function WatchFlightButton({ origin, destination }: Props) {
  const { user } = useSession();
  const { openModal } = useAuthModal();
  const [isWishlistModalOpen, setWishlistModalOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      openModal();
    } else {
      setWishlistModalOpen(true);
    }
  };

  return (
    <>
      <button onClick={handleClick} className={styles.watchButton} type="button">
        <Bell size={18} />
        <span>Set price alert</span>
      </button>
      {isWishlistModalOpen && (
        <WishlistModal
          origin={origin}
          destination={destination}
          onClose={() => setWishlistModalOpen(false)}
        />
      )}
    </>
  );
}
