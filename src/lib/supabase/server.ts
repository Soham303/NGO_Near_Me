import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

export const createAdminClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  
  return createClient(cleanUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
