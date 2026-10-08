import { requireAdmin } from "@/lib/api/admin";
import { pageOrders, readKind, readOrderStatus, readPage } from "@/lib/admin/pages";
import { parseDateRange } from "@/lib/admin/range";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const range = parseDateRange(url.searchParams.get("from"), url.searchParams.get("to"));
  if ("error" in range) return Response.json({ error: range.error }, { status: 400 });

  const page = await pageOrders(createAdminClient(), {
    page: readPage(url.searchParams.get("page")),
    q: url.searchParams.get("q") ?? "",
    status: readOrderStatus(url.searchParams.get("status")),
    kind: readKind(url.searchParams.get("kind")),
    from: range.from,
    to: range.to,
  });
  return Response.json(page);
}
