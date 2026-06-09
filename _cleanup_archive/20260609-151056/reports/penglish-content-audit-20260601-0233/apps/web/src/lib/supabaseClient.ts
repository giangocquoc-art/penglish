import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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

export function getSupabaseStatusLabel(syncError = false) {
  if (!isSupabaseConfigured) return 'Lưu trên thiết bị';
  if (syncError) return 'Chưa đồng bộ được';
  return 'Đã đồng bộ';
}
