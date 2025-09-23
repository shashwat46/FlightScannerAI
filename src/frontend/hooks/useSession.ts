'use client';
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client';

interface SessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessionState({
          session,
          user: session?.user ?? null,
          isLoading: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return sessionState;
}
