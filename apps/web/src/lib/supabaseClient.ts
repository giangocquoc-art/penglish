import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const authUnavailableReason = isSupabaseConfigured ? null : 'missing-supabase-env';

if (!isSupabaseConfigured) {
  console.warn('[PooEnglish auth] Missing Supabase env. Google login is optional and the app will continue in guest mode.');
}

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
    message: isSupabaseConfigured ? null : 'Cổng vào học bằng Google chưa sẵn sàng. Bạn thử lại sau một chút nhé.',
  };
}

export function getSupabaseStatusLabel(syncError = false) {
  if (!isSupabaseConfigured) return 'Poo đang giữ tiến độ cho bạn';
  if (syncError) return 'Poo sẽ lưu lên tài khoản khi mạng ổn hơn';
  return 'Đã lưu lên tài khoản';
}
