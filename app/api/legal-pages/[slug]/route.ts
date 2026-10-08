import { readJson, requireAdmin } from "@/lib/api/admin";
import { isLegalSlug, legalPageFromInput, mapLegalPage } from "@/lib/legal";
import { getLegalPage } from "@/lib/legal.server";
import { createAdminClient } from "@/lib/supabase/admin";

const legalSelect = "slug, title, body, updated_at";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!isLegalSlug(slug)) return Response.json({ error: "Page not found." }, { status: 404 });

  const page = await getLegalPage(slug);
  return Response.json({ page });
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { slug } = await context.params;
  if (!isLegalSlug(slug)) return Response.json({ error: "Page not found." }, { status: 404 });

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const parsed = legalPageFromInput(parsedBody.body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("legal_pages")
    .update({ ...parsed.page, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select(legalSelect)
    .maybeSingle();

  if (error || !data) return Response.json({ error: "The page could not be updated." }, { status: 500 });
  const page = mapLegalPage(data);
  if (!page) return Response.json({ error: "The page could not be updated." }, { status: 500 });
  return Response.json({ page });
}
