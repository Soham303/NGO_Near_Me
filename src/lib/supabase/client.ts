import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Automatically sanitize URL in case user provided /rest/v1 or trailing slashes
const cleanUrl = rawUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

const cleanKey = rawAnonKey.trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    cleanUrl &&
    cleanKey &&
    cleanUrl.startsWith('https://') &&
    !cleanUrl.includes('placeholder') &&
    !cleanUrl.includes('your-project-id') &&
    !cleanKey.includes('placeholder')
  );
};

// Fallback dummy URL and Key for build-time safety when env vars aren't populated yet
const safeUrl = isSupabaseConfigured() ? cleanUrl : 'https://placeholder.supabase.co';
const safeAnonKey = isSupabaseConfigured() ? cleanKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
