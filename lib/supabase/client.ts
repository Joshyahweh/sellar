import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  if (!hasSupabaseEnv()) return null;

  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
