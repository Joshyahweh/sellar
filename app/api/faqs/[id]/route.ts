import { isUuid, readJson, requireAdmin } from "@/lib/api/admin";
import { faqFromInput, mapFaq } from "@/lib/faqs";
import { createAdminClient } from "@/lib/supabase/admin";

const faqSelect = "id, question, answer, position";

function mapped(row: { id: unknown; question: unknown; answer: unknown; position: unknown }) {
  return mapFaq({
    id: String(row.id),
    question: String(row.question),
    answer: String(row.answer),
    position: Number(row.position),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "FAQ not found." }, { status: 404 });

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const admin = createAdminClient();
  const { data: existing } = await admin.from("faqs").select(faqSelect).eq("id", id).maybeSingle();
  if (!existing) return Response.json({ error: "FAQ not found." }, { status: 404 });

  const current = mapped(existing);
  const parsed = faqFromInput({
    question: parsedBody.body.question === undefined ? current.question : parsedBody.body.question,
    answer: parsedBody.body.answer === undefined ? current.answer : parsedBody.body.answer,
    position: parsedBody.body.position === undefined ? current.position : parsedBody.body.position,
  });
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await admin.from("faqs").update(parsed.faq).eq("id", id).select(faqSelect).single();
  if (error || !data) return Response.json({ error: "The FAQ could not be updated." }, { status: 500 });
  return Response.json({ faq: mapped(data) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "FAQ not found." }, { status: 404 });

  const admin = createAdminClient();
  const { data: existing } = await admin.from("faqs").select("id").eq("id", id).maybeSingle();
  if (!existing) return Response.json({ error: "FAQ not found." }, { status: 404 });

  const { error } = await admin.from("faqs").delete().eq("id", id);
  if (error) return Response.json({ error: "The FAQ could not be deleted." }, { status: 500 });
  return Response.json({ deleted: true });
}
