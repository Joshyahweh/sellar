"use server";

import { allowRequest, rateLimited } from "@/lib/rate-limit";
import { reviewFromInput } from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export async function submitReview(input: {
  rating: number;
  body: string;
}): Promise<{ error?: string; message?: string }> {
  if (!(await allowRequest("submit-review", 5, FIFTEEN_MINUTES))) return rateLimited;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Sign in before writing a review." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .maybeSingle();
  const authorName =
    String(profile?.full_name || auth.user.user_metadata?.full_name || "Reader").trim() || "Reader";

  const reviewBody = String(input.body ?? "").trim();
  if (reviewBody.length > 500) return { error: "Review must be 500 characters or fewer." };

  const parsed = reviewFromInput({ authorName, rating: input.rating, body: reviewBody });
  if ("error" in parsed) return { error: parsed.error };

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").insert({
    ...parsed.review,
    user_id: auth.user.id,
    status: "pending",
  });

  if (error) return { error: "The review could not be sent." };
  return { message: "Your review was sent. It will appear after it is approved." };
}
