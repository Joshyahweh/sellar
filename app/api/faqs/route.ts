import { readJson, requireAdmin } from "@/lib/api/admin";
import { defaultFaqs, faqFromInput, mapFaq } from "@/lib/faqs";
import { listFaqs } from "@/lib/faqs.server";
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

export async function GET() {
  const faqs = await listFaqs();
  return Response.json({ faqs });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const parsed = faqFromInput(parsedBody.body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin.from("faqs").insert(parsed.faq).select(faqSelect).single();
  if (error || !data) return Response.json({ error: "The FAQ could not be created." }, { status: 500 });
  return Response.json({ faq: mapped(data) }, { status: 201 });
}

export function OPTIONS() {
  return Response.json({ defaults: defaultFaqs });
}
