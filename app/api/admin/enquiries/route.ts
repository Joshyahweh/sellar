import { pageEnquiries, readPage } from "@/lib/admin/pages";
import { requireAdmin } from "@/lib/api/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const page = await pageEnquiries(createAdminClient(), {
    page: readPage(url.searchParams.get("page")),
    q: url.searchParams.get("q") ?? "",
  });
  return Response.json(page);
}
