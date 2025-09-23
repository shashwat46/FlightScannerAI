'use client';
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client';

interface SessionState {
  session: Session | null;
  user: User | null;
  loaded: boolean;
}

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    user: null,
    loaded: false
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const fetchInitial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionState({ session, user: session?.user ?? null, loaded: true });
    };

    fetchInitial();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessionState({ session, user: session?.user ?? null, loaded: true });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { ...sessionState, isLoading: !sessionState.loaded };
}
