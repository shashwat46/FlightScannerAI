'use client';
import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { useAuthModal } from '@/src/frontend/contexts/AuthModalContext';
import styles from './styles.module.css';

export default function LoginModal() {
  const { closeModal } = useAuthModal();
  const supabase = getSupabaseBrowserClient();
  const router = require('next/navigation').useRouter?.() ?? null;

  useEffect(() => {
    // Listen for successful authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        closeModal();
        if (router) router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, closeModal]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Welcome to FlightScanner AI</h2>
        <p className={styles.modalSubtitle}>
          Sign in to unlock AI-powered insights, price alerts, and personalized recommendations
        </p>
      </div>
      
      <div className={styles.authContainer}>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'var(--color-primary)',
                  brandAccent: 'var(--color-primary-hover)',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'var(--color-card)',
                  defaultButtonBackgroundHover: 'var(--color-secondary)',
                  defaultButtonBorder: 'var(--color-border)',
                  defaultButtonText: 'var(--color-text)',
                  dividerBackground: 'var(--color-border)',
                  inputBackground: 'var(--color-card)',
                  inputBorder: 'var(--color-border)',
                  inputBorderHover: 'var(--color-primary)',
                  inputBorderFocus: 'var(--color-primary)',
                  inputText: 'var(--color-text)',
                  inputLabelText: 'var(--color-text)',
                  inputPlaceholder: 'var(--color-text-light)',
                  messageText: 'var(--color-text)',
                  messageTextDanger: 'var(--color-error)',
                  anchorTextColor: 'var(--color-primary)',
                  anchorTextHoverColor: 'var(--color-primary-hover)',
                },
                space: {
                  spaceSmall: 'var(--space-sm)',
                  spaceMedium: 'var(--space-md)',
                  spaceLarge: 'var(--space-lg)',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: 'var(--radius-md)',
                  buttonBorderRadius: 'var(--radius-md)',
                  inputBorderRadius: 'var(--radius-md)',
                },
              },
            },
          }}
          providers={['google', 'github']}
          socialLayout="horizontal"
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={false}
        />
      </div>
    </div>
  );
}
