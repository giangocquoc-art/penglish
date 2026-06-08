import { useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { PENGUISH_AUTH_UPDATED_EVENT, useAuth } from '../../features/auth/AuthProvider';

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
  dataModeLabel: 'Tiến độ lưu trên thiết bị này' | 'Đã đồng bộ' | 'Chưa đồng bộ được';
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

export const SUPABASE_AUTH_EVENT = PENGUISH_AUTH_UPDATED_EVENT;

function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function displayNameFromUser(user: User | null | undefined, fallback = 'Bạn học P-English') {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || fallback;
}

export function avatarFromUser(user: User | null | undefined) {
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
}

export function getGuestDataModeLabel() {
  return 'Tiến độ lưu trên thiết bị này' as const;
}

export async function getCurrentSupabaseUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function signInWithGoogle() {
  if (!supabase) {
    return { ok: false, message: 'Đăng nhập Google chưa bật. Bạn vẫn có thể học thử trên thiết bị này.' };
  }

  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    console.error('Supabase Google OAuth failed', error);
    return { ok: false, message: 'Chưa mở được đăng nhập Google. Tiến độ trên thiết bị này vẫn an toàn.' };
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
  const auth = useAuth();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(() => getLocalUser());

  useEffect(() => {
    const refreshLocalUser = () => setLocalUser(getLocalUser());
    window.addEventListener('storage', refreshLocalUser);
    window.addEventListener(SUPABASE_AUTH_EVENT, refreshLocalUser);
    return () => {
      window.removeEventListener('storage', refreshLocalUser);
      window.removeEventListener(SUPABASE_AUTH_EVENT, refreshLocalUser);
    };
  }, []);

  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((_event: AuthChangeEvent, _session: Session | null) => {
      setSyncError(null);
      window.dispatchEvent(new Event(SUPABASE_AUTH_EVENT));
    });
    return () => subscription?.data.subscription.unsubscribe();
  }, []);

  return useMemo(() => {
    const isSignedIn = Boolean(auth.user?.id);
    const mode: PEnglishAuthMode = isSignedIn ? 'supabase' : 'guest';
    const dataModeLabel = isSignedIn ? (syncError ? 'Chưa đồng bộ được' : 'Đã đồng bộ') : 'Tiến độ lưu trên thiết bị này';

    return {
      mode,
      isSupabaseEnabled: isSupabaseConfigured,
      isSignedIn,
      loading: auth.loading,
      userId: auth.user?.id ?? null,
      email: auth.user?.email ?? (isSignedIn ? null : localUser?.email ?? null),
      displayName: isSignedIn ? displayNameFromUser(auth.user) : 'Khách',
      avatarUrl: isSignedIn ? avatarFromUser(auth.user) : '',
      dataModeLabel,
      syncError,
    };
  }, [auth.loading, auth.user, localUser?.email, syncError]);
}
