import { requireAdmin } from "@/lib/api/admin";
import { parseDateRange } from "@/lib/admin/range";
import { loadAdminDashboard } from "@/lib/admin/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const range = parseDateRange(url.searchParams.get("from"), url.searchParams.get("to"));
  if ("error" in range) return Response.json({ error: range.error }, { status: 400 });

  return Response.json(await loadAdminDashboard(createAdminClient(), range));
}
