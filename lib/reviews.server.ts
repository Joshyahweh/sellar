import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";
import { defaultReviews, mapReview, type BookReview } from "@/lib/reviews";

export async function listReviews(): Promise<BookReview[]> {
  if (!hasSupabaseEnv()) return defaultReviews;

  const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, created_at")
    .order("created_at", { ascending: false });

  if (error || !data?.length) return defaultReviews;
  return data.map((row) =>
    mapReview({
      id: String(row.id),
      author_name: String(row.author_name),
      rating: Number(row.rating),
      body: String(row.body),
      created_at: String(row.created_at),
    }),
  );
}
