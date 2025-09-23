'use client';
import React from 'react';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { useSession } from '@/src/frontend/hooks/useSession';
import { useAuthModal } from '@/src/frontend/contexts/AuthModalContext';
import ProfileDropdown from '../ProfileDropdown';
import styles from './styles.module.css';

export default function AuthButton() {
  const { user, isLoading } = useSession();
  const { openModal } = useAuthModal();
  const supabase = getSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (user) {
    return (
      <div className={styles.userContainer}>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>{user.email || 'User'}</span>
        </div>
        <button onClick={handleSignOut} className={styles.logoutButton} type="button">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button onClick={openModal} className={styles.loginButton} type="button">
      Sign In
    </button>
  );
}
