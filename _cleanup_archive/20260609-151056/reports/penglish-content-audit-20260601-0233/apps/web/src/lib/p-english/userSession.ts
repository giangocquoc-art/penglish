import { useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export type PEnglishAuthMode = 'guest' | 'supabase';

export type PEnglishUserSession = {
  mode: PEnglishAuthMode;
  isSupabaseEnabled: boolean;
  isSignedIn: boolean;
  loading: boolean;
  userId: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string;
  dataModeLabel: 'Lưu trên thiết bị' | 'Đã đồng bộ' | 'Chưa đồng bộ được';
  syncError: string | null;
};

type LocalUser = {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  coin?: number;
  streak?: number;
  vip?: boolean;
};

export const SUPABASE_AUTH_EVENT = 'p-english:supabase-auth-updated';

function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

function displayNameFromUser(user: any, fallback = 'Bạn học P-English') {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || fallback;
}

function avatarFromUser(user: any) {
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
}

export function getGuestDataModeLabel() {
  return 'Lưu trên thiết bị' as const;
}

export async function getCurrentSupabaseUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function signInWithGoogle() {
  if (!supabase) {
    return { ok: false, message: 'Google chưa bật. Bạn vẫn có thể học ở chế độ local.' };
  }

  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    console.error('Supabase Google OAuth failed', error);
    return { ok: false, message: 'Chưa mở được đăng nhập Google. Bạn vẫn có thể học ở chế độ local.' };
  }

  return { ok: true, message: null };
}

export async function signOutSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SUPABASE_AUTH_EVENT));
}

export async function upsertSignedInProfile() {
  const user = await getCurrentSupabaseUser();
  if (!supabase || !user) return { ok: false, message: 'not-signed-in' };

  const { error } = await supabase.from('penglish_profiles').upsert({
    user_id: user.id,
    display_name: displayNameFromUser(user),
    avatar_url: avatarFromUser(user),
    mode: 'signed_in',
    updated_at: new Date().toISOString(),
  });

  return { ok: !error, message: error?.message ?? null };
}

export function usePEnglishSession(): PEnglishUserSession {
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(() => getLocalUser());

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      setLocalUser(getLocalUser());
      if (!supabase) {
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error) {
        setSyncError(error.message);
        setSupabaseUser(null);
      } else {
        setSyncError(null);
        setSupabaseUser(data.user ?? null);
      }
      setLoading(false);
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(SUPABASE_AUTH_EVENT, refresh);

    const subscription = supabase?.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSupabaseUser(session?.user ?? null);
      setSyncError(null);
      setLoading(false);
      window.dispatchEvent(new Event(SUPABASE_AUTH_EVENT));
    });

    return () => {
      active = false;
      window.removeEventListener('storage', refresh);
      window.removeEventListener(SUPABASE_AUTH_EVENT, refresh);
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  return useMemo(() => {
    const isSignedIn = Boolean(supabaseUser?.id);
    const mode: PEnglishAuthMode = isSignedIn ? 'supabase' : 'guest';
    const dataModeLabel = isSignedIn ? (syncError ? 'Chưa đồng bộ được' : 'Đã đồng bộ') : 'Lưu trên thiết bị';

    return {
      mode,
      isSupabaseEnabled: isSupabaseConfigured,
      isSignedIn,
      loading,
      userId: supabaseUser?.id ?? null,
      email: supabaseUser?.email ?? localUser?.email ?? null,
      displayName: isSignedIn ? displayNameFromUser(supabaseUser) : (localUser?.name ?? 'Khách'),
      avatarUrl: isSignedIn ? avatarFromUser(supabaseUser) : (localUser?.avatar ?? ''),
      dataModeLabel,
      syncError,
    };
  }, [loading, localUser, supabaseUser, syncError]);
}
