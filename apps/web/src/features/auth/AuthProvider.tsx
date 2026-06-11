import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { mergeCloudAndLocalFoundation48Progress } from '../foundation48/foundation48CloudProgress';

export const PENGUISH_AUTH_UPDATED_EVENT = 'penglish-auth-updated';

const AUTH_GUEST_TIMEOUT_MS = 2500;

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

function dispatchAuthUpdated() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
}

async function withAuthTimeout<T>(task: Promise<T>, fallback: T, label: string): Promise<T> {
  let timeoutId: number | undefined;

  const timeout = new Promise<T>((resolve) => {
    if (typeof window === 'undefined') return resolve(fallback);
    timeoutId = window.setTimeout(() => {
      console.warn(`[PooEnglish auth] ${label} timed out after ${AUTH_GUEST_TIMEOUT_MS}ms; continuing as guest.`);
      resolve(fallback);
    }, AUTH_GUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authUnavailable = !isSupabaseConfigured || !supabase;

  const loadSessionFromProvider = useCallback(async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      dispatchAuthUpdated();
      return null;
    }

    if (showLoading) setLoading(true);
    try {
      const nextSession = await withAuthTimeout(
        supabase.auth.getSession()
          .then(({ data, error }) => (error ? null : data.session ?? null))
          .catch((error) => {
            console.warn('[PooEnglish auth] Could not read Supabase session; continuing as guest.', error);
            return null;
          }),
        null,
        'getSession',
      );
      setSession(nextSession);
      return nextSession;
    } finally {
      setLoading(false);
      dispatchAuthUpdated();
    }
  }, []);

  const refreshSession = useCallback(() => loadSessionFromProvider({ showLoading: true }), [loadSessionFromProvider]);

  useEffect(() => {
    let active = true;
    let fallbackTimer: number | undefined;

    if (typeof window !== 'undefined') {
      fallbackTimer = window.setTimeout(() => {
        if (!active) return;
        console.warn(`[PooEnglish auth] Initial auth check exceeded ${AUTH_GUEST_TIMEOUT_MS}ms; rendering guest mode.`);
        setSession(null);
        setLoading(false);
        dispatchAuthUpdated();
      }, AUTH_GUEST_TIMEOUT_MS);
    }

    const hydrate = async () => {
      try {
        const nextSession = await loadSessionFromProvider();
        if (!active) return;
        setSession(nextSession);
      } catch (error) {
        console.warn('[PooEnglish auth] Initial auth check failed; rendering guest mode.', error);
        if (active) setSession(null);
      } finally {
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        if (active) setLoading(false);
        dispatchAuthUpdated();
      }
    };

    void hydrate();

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
      dispatchAuthUpdated();
    });

    return () => {
      active = false;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      subscription?.data.subscription.unsubscribe();
    };
  }, [loadSessionFromProvider]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void withAuthTimeout(
      mergeCloudAndLocalFoundation48Progress(userId).catch((error) => {
        console.warn('[PooEnglish auth] Could not merge cloud progress; keeping local guest progress available.', error);
      }),
      undefined,
      'mergeCloudAndLocalFoundation48Progress',
    );
  }, [session?.user?.id]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { ok: false, message: 'Poo chưa mở được cổng đăng nhập. Bạn vẫn có thể học ở chế độ khách nhé.' };

    const intendedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`.replace(/#$/, '');
    if (intendedPath && !/^\/(login|auth\/callback)/.test(window.location.pathname)) {
      try {
        window.sessionStorage.setItem('penglish-auth-redirect', intendedPath);
      } catch {
        // Redirect preservation is helpful but not required for auth to work.
      }
    }

    try {
      const result = await withAuthTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: new URL('/auth/callback', window.location.origin).toString(),
          },
        }),
        { data: { provider: 'google' as const, url: '' }, error: null },
        'signInWithOAuth',
      );

      if (result.error) return { ok: false, message: 'Poo chưa mở được cổng đăng nhập. Bạn vẫn có thể học ở chế độ khách nhé.' };
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      dispatchAuthUpdated();
      return { ok: true };
    }

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.signOut().catch((error) => ({ error })),
        { error: null },
        'signOut',
      );
      if (error) return { ok: false, message: 'Chưa đăng xuất được khỏi Google.' };
      return { ok: true };
    } finally {
      setSession(null);
      setLoading(false);
      dispatchAuthUpdated();
    }
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
