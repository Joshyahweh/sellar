import { isUuid, readJson, requireAdmin } from "@/lib/api/admin";
import { mapReview, reviewFromInput, reviewSelect, type ReviewStatus } from "@/lib/reviews";
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

function moderationUpdate(input: Record<string, unknown>) {
  const status = String(input.status ?? "");
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    return { error: "Status must be pending, approved, or rejected." };
  }
  const reason = String(input.rejectionReason ?? "").trim();
  if (reason.length > 500) return { error: "The reason must be 500 characters or fewer." };
  return {
    update: {
      status: status as ReviewStatus,
      rejection_reason: status === "rejected" && reason ? reason : null,
    },
  };
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Review not found." }, { status: 404 });

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const admin = createAdminClient();
  const { data: existing } = await admin.from("reviews").select(reviewSelect).eq("id", id).maybeSingle();
  if (!existing) return Response.json({ error: "Review not found." }, { status: 404 });

  if (parsedBody.body.status !== undefined) {
    const moderation = moderationUpdate(parsedBody.body);
    if ("error" in moderation) return Response.json({ error: moderation.error }, { status: 400 });
    const { data, error } = await admin
      .from("reviews")
      .update(moderation.update)
      .eq("id", id)
      .select(reviewSelect)
      .single();
    if (error || !data) return Response.json({ error: "The review could not be updated." }, { status: 500 });
    return Response.json({ review: mapped(data) });
  }

  const current = mapped(existing);
  const parsed = reviewFromInput({
    authorName: parsedBody.body.authorName === undefined ? current.authorName : parsedBody.body.authorName,
    body: parsedBody.body.body === undefined ? current.body : parsedBody.body.body,
    rating: parsedBody.body.rating === undefined ? current.rating : parsedBody.body.rating,
  });
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await admin
    .from("reviews")
    .update(parsed.review)
    .eq("id", id)
    .select(reviewSelect)
    .single();

  if (error || !data) return Response.json({ error: "The review could not be updated." }, { status: 500 });
  return Response.json({ review: mapped(data) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Review not found." }, { status: 404 });

  const admin = createAdminClient();
  const { data: existing } = await admin.from("reviews").select("id").eq("id", id).maybeSingle();
  if (!existing) return Response.json({ error: "Review not found." }, { status: 404 });

  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) return Response.json({ error: "The review could not be deleted." }, { status: 500 });
  return Response.json({ deleted: true });
}
