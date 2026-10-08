import { readJson, requireAdmin } from "@/lib/api/admin";
import { defaultReviews, mapReview, reviewFromInput, reviewSelect } from "@/lib/reviews";
import { createAdminClient } from "@/lib/supabase/admin";

function mapped(row: {
  id: unknown;
  author_name: unknown;
  rating: unknown;
  body: unknown;
  created_at: unknown;
  status?: unknown;
  rejection_reason?: unknown;
}) {
  return mapReview({
    id: String(row.id),
    author_name: String(row.author_name),
    rating: Number(row.rating),
    body: String(row.body),
    created_at: String(row.created_at),
    status: row.status ? String(row.status) : "approved",
    rejection_reason: row.rejection_reason ? String(row.rejection_reason) : null,
  });
}

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select(reviewSelect)
    .order("created_at", { ascending: false });
  if (error || !data) return Response.json({ error: "Reviews could not be loaded." }, { status: 500 });
  return Response.json({ reviews: data.map((row) => mapped(row)) });
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
    .insert({ ...parsed.review, status: "approved" })
    .select(reviewSelect)
    .single();

  if (error || !data) return Response.json({ error: "The review could not be created." }, { status: 500 });
  return Response.json({ review: mapped(data) }, { status: 201 });
}

export function OPTIONS() {
  return Response.json({ defaults: defaultReviews });
}
