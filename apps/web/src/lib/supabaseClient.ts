import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const authUnavailableReason = isSupabaseConfigured ? null : 'missing-supabase-env';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'p-english:supabase-auth',
      },
    })
  : null;

export function getSupabaseAuthUnavailableState() {
  return {
    authUnavailable: !isSupabaseConfigured,
    reason: authUnavailableReason,
    message: isSupabaseConfigured ? null : 'Đăng nhập Google chưa bật. Bạn vẫn có thể học thử trên thiết bị này.',
  };
}

export function getSupabaseStatusLabel(syncError = false) {
  if (!isSupabaseConfigured) return 'Lưu trên thiết bị';
  if (syncError) return 'Chưa đồng bộ được';
  return 'Đã đồng bộ';
}
