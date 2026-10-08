import { requireAdmin } from "@/lib/api/admin";
import { pageUsers, readPage } from "@/lib/admin/pages";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const purchased = url.searchParams.get("purchased");
  const page = await pageUsers(createAdminClient(), {
    page: readPage(url.searchParams.get("page")),
    q: url.searchParams.get("q") ?? "",
    purchased: purchased === "yes" || purchased === "no" ? purchased : "",
  });
  return Response.json(page);
}
