import { readJson, requireAdmin } from "@/lib/api/admin";
import { defaultReviews, mapReview, reviewFromInput } from "@/lib/reviews";
import { listReviews } from "@/lib/reviews.server";
import { createAdminClient } from "@/lib/supabase/admin";

const reviewSelect = "id, author_name, rating, body, created_at";

function mapped(row: {
  id: unknown;
  author_name: unknown;
  rating: unknown;
  body: unknown;
  created_at: unknown;
}) {
  return mapReview({
    id: String(row.id),
    author_name: String(row.author_name),
    rating: Number(row.rating),
    body: String(row.body),
    created_at: String(row.created_at),
  });
}

export async function GET() {
  const reviews = await listReviews();
  return Response.json({ reviews });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const parsed = reviewFromInput(parsedBody.body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .insert(parsed.review)
    .select(reviewSelect)
    .single();

  if (error || !data) return Response.json({ error: "The review could not be created." }, { status: 500 });
  return Response.json({ review: mapped(data) }, { status: 201 });
}

export function OPTIONS() {
  return Response.json({ defaults: defaultReviews });
}
