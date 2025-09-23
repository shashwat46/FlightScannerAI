'use client';
import React from 'react';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { useSession } from '@/src/frontend/hooks/useSession';
import { useAuthModal } from '@/src/frontend/contexts/AuthModalContext';
import ProfileDropdown from '../ProfileDropdown';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function AuthButton() {
  const { user, isLoading } = useSession();
  const { openModal } = useAuthModal();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (user) {
    return <ProfileDropdown user={user} onLogout={handleSignOut} />;
  }

  return (
    <button onClick={openModal} className={styles.loginButton} type="button">
      Sign In
    </button>
  );
}
