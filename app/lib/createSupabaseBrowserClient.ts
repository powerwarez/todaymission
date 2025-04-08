import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  );
} 