import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { mergeCloudAndLocalFoundation48Progress } from '../foundation48/foundation48CloudProgress';

export const PENGUISH_AUTH_UPDATED_EVENT = 'penglish-auth-updated';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authUnavailable: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<{ ok: boolean; message?: string }>;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authUnavailable = !isSupabaseConfigured || !supabase;

  const loadSessionFromProvider = useCallback(async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return null;
    }

    if (showLoading) setLoading(true);
    const { data, error } = await supabase.auth.getSession();
    const nextSession = error ? null : data.session ?? null;
    setSession(nextSession);
    setLoading(false);
    window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
    return nextSession;
  }, []);

  const refreshSession = useCallback(() => loadSessionFromProvider({ showLoading: true }), [loadSessionFromProvider]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (!supabase) {
        if (active) setLoading(false);
        return;
      }
      const nextSession = await loadSessionFromProvider();
      if (!active) return;
      setSession(nextSession);
    };

    void hydrate();

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [loadSessionFromProvider]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void mergeCloudAndLocalFoundation48Progress(userId).catch(() => undefined);
  }, [session?.user?.id]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { ok: false, message: 'Poo chưa mở được cổng đăng nhập. Bạn thử lại sau một chút nhé.' };

    const intendedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (intendedPath && !/^\/(login|auth\/callback)/.test(window.location.pathname)) {
      try {
        window.sessionStorage.setItem('penglish-auth-redirect', intendedPath);
      } catch {
        // Redirect preservation is helpful but not required for auth to work.
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { ok: false, message: 'Poo chưa mở được cổng đăng nhập. Bạn thử lại sau một chút nhé.' };
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return { ok: false, message: 'Đăng nhập Google chưa bật.' };
    const { error } = await supabase.auth.signOut();
    setSession(null);
    window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
    if (error) return { ok: false, message: 'Chưa đăng xuất được khỏi Google.' };
    return { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    isAuthenticated: Boolean(session?.user),
    authUnavailable,
    signInWithGoogle,
    signOut,
    refreshSession,
  }), [authUnavailable, loading, refreshSession, session, signInWithGoogle, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
