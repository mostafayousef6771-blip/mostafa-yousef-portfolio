import { createClient, SupabaseClient } from '@supabase/supabase-js';

export let supabaseUrl: string = (import.meta as any).env?.VITE_SUPABASE_URL || '';
export let supabaseAnonKey: string = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export let supabase: SupabaseClient | null = null;

let initPromise: Promise<SupabaseClient | null> | null = null;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-supabase-project') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

export const initializeSupabase = async (): Promise<SupabaseClient | null> => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        if (data.supabaseUrl) {
          supabaseUrl = data.supabaseUrl;
        }
        if (data.supabaseAnonKey) {
          supabaseAnonKey = data.supabaseAnonKey;
        }
      }
    } catch (err) {
      console.warn('Could not load /api/config, falling back to build environment:', err);
    }

    if (isSupabaseConfigured()) {
      try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        supabase = null;
      }
    } else {
      supabase = null;
    }

    return supabase;
  })();

  return initPromise;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};
