import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";
import { defaultFaqs, mapFaq, type BookFaq } from "@/lib/faqs";

export async function listFaqs(): Promise<BookFaq[]> {
  if (!hasSupabaseEnv()) return defaultFaqs;

  const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) return defaultFaqs;
  return data.map((row) =>
    mapFaq({
      id: String(row.id),
      question: String(row.question),
      answer: String(row.answer),
      position: Number(row.position),
    }),
  );
}
