import { requireAdmin } from "@/lib/api/admin";
import { pageBooks, readKind, readPage } from "@/lib/admin/pages";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const page = await pageBooks(createAdminClient(), {
    page: readPage(url.searchParams.get("page")),
    q: url.searchParams.get("q") ?? "",
    kind: readKind(url.searchParams.get("kind")),
  });
  return Response.json(page);
}
