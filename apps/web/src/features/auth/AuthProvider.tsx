import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { mergeCloudAndLocalFoundation48Progress, syncLocalFoundation48ProgressToCloud } from '../foundation48/foundation48CloudProgress';
import { FOUNDATION48_PROGRESS_UPDATED_EVENT, getFoundation48Progress } from '../foundation48/foundation48Progress';

export const PENGUISH_AUTH_UPDATED_EVENT = 'penglish-auth-updated';

const SYNC_PROMPT_DISMISSED_KEY = 'penglish-foundation48-google-sync-dismissed-v1';

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

function hasLocalFoundation48Progress() {
  try {
    return Object.keys(getFoundation48Progress().days || {}).length > 0;
  } catch {
    return false;
  }
}

function hasDismissedSyncPrompt(userId: string) {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(`${SYNC_PROMPT_DISMISSED_KEY}:${userId}`) === '1';
  } catch {
    return true;
  }
}

function dismissSyncPrompt(userId: string) {
  try {
    window.localStorage.setItem(`${SYNC_PROMPT_DISMISSED_KEY}:${userId}`, '1');
  } catch {
    // Non-critical; the banner can reappear if localStorage is locked.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncPromptVisible, setSyncPromptVisible] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const authUnavailable = !isSupabaseConfigured || !supabase;

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.getSession();
    const nextSession = error ? null : data.session ?? null;
    setSession(nextSession);
    setLoading(false);
    window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
    return nextSession;
  }, []);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (!supabase) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
      window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
    };

    void hydrate();

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      window.dispatchEvent(new Event(PENGUISH_AUTH_UPDATED_EVENT));
      if (nextSession?.user?.id) {
        void mergeCloudAndLocalFoundation48Progress(nextSession.user.id).catch(() => undefined);
      }
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setSyncPromptVisible(false);
      return;
    }

    void mergeCloudAndLocalFoundation48Progress(userId).catch(() => undefined);
    setSyncPromptVisible(hasLocalFoundation48Progress() && !hasDismissedSyncPrompt(userId));
  }, [session?.user?.id]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { ok: false, message: 'Google Login chưa được cấu hình. Vui lòng kiểm tra Supabase Auth settings.' };

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

    if (error) return { ok: false, message: 'Google Login chưa được cấu hình. Vui lòng kiểm tra Supabase Auth settings.' };
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

  const userId = session?.user?.id;

  return (
    <AuthContext.Provider value={value}>
      {children}
      {userId && syncPromptVisible ? (
        <Box
          position="fixed"
          left={{ base: '4', md: '50%' }}
          right={{ base: '4', md: 'auto' }}
          bottom={{ base: 'calc(var(--penglish-mobile-safe-bottom) + 16px)', md: '24px' }}
          transform={{ base: 'none', md: 'translateX(-50%)' }}
          zIndex="toast"
          maxW="560px"
          bg="rgba(255,255,255,0.96)"
          border="1px solid"
          borderColor="#BAE6FD"
          borderRadius="2xl"
          boxShadow="0 18px 48px rgba(31,111,214,0.18)"
          px="4"
          py="3"
        >
          <HStack gap="3" align="center" justify="space-between" flexWrap="wrap">
            <Text color="#102A43" fontWeight="850" fontSize="sm">
              Đồng bộ tiến độ trên thiết bị này lên tài khoản Google?
            </Text>
            <HStack gap="2">
              <Button
                size="sm"
                borderRadius="full"
                bg="#1F6FD6"
                color="white"
                isLoading={syncBusy}
                onClick={async () => {
                  setSyncBusy(true);
                  await syncLocalFoundation48ProgressToCloud(userId).catch(() => undefined);
                  dismissSyncPrompt(userId);
                  setSyncPromptVisible(false);
                  setSyncBusy(false);
                  window.dispatchEvent(new Event(FOUNDATION48_PROGRESS_UPDATED_EVENT));
                }}
                _hover={{ bg: '#185BB2' }}
              >
                Đồng bộ
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                variant="ghost"
                onClick={() => {
                  dismissSyncPrompt(userId);
                  setSyncPromptVisible(false);
                }}
              >
                Để sau
              </Button>
            </HStack>
          </HStack>
        </Box>
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
