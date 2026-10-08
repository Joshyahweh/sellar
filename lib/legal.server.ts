import "server-only";
import { createClient } from "@supabase/supabase-js";
import { defaultLegalPage, defaultLegalPages, mapLegalPage, type LegalPage, type LegalSlug } from "@/lib/legal";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";

const legalSelect = "slug, title, body, updated_at";

function publicClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const fallback = defaultLegalPage(slug);
  if (!hasSupabaseEnv()) return fallback;

  const { data, error } = await publicClient().from("legal_pages").select(legalSelect).eq("slug", slug).maybeSingle();
  if (error || !data) return fallback;
  return mapLegalPage(data) ?? fallback;
}

export async function listLegalPages(): Promise<LegalPage[]> {
  if (!hasSupabaseEnv()) return defaultLegalPages;

  const { data, error } = await publicClient().from("legal_pages").select(legalSelect).order("slug");
  if (error || !data?.length) return defaultLegalPages;

  const stored = new Map(
    data.flatMap((row) => {
      const page = mapLegalPage(row);
      return page ? [[page.slug, page] as const] : [];
    }),
  );

  return defaultLegalPages.map((page) => stored.get(page.slug) ?? page);
}
