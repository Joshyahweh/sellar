import { isUuid, readJson, requireAdmin } from "@/lib/api/admin";
import { orderStatuses, type OrderStatus } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
  awaiting: ["confirmed", "cancelled"],
  confirmed: ["transit", "cancelled"],
  transit: ["delivered", "cancelled"],
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Order not found." }, { status: 404 });

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;
  const body = parsedBody.body;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("orders")
    .select("id, status, products(kind)")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return Response.json({ error: "Order not found." }, { status: 404 });

  const product = Array.isArray(existing.products) ? existing.products[0] : existing.products;
  if (product?.kind !== "hard_copy") {
    return Response.json({ error: "E-copy orders are ready as soon as they are paid." }, { status: 400 });
  }

  const status = existing.status as OrderStatus;
  const update: { status?: OrderStatus; estimated_delivery_on?: string | null } = {};

  if ("status" in body) {
    const requested = body.status;
    if (typeof requested !== "string" || !orderStatuses.includes(requested as OrderStatus)) {
      return Response.json({ error: "Choose a valid order status." }, { status: 400 });
    }
    const allowed = nextStatuses[status] ?? [];
    if (!allowed.includes(requested as OrderStatus)) {
      return Response.json({ error: "This order cannot move to that step." }, { status: 400 });
    }
    update.status = requested as OrderStatus;
  }

  if ("estimatedDelivery" in body) {
    const value = body.estimatedDelivery;
    if (value === null || value === "") {
      update.estimated_delivery_on = null;
    } else if (typeof value === "string" && datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00.000Z`))) {
      update.estimated_delivery_on = value;
    } else {
      return Response.json({ error: "Choose a valid delivery date." }, { status: 400 });
    }
    const open = status === "awaiting" || status === "confirmed" || status === "transit";
    if (!open) {
      return Response.json({ error: "The delivery date can be set while the order is still moving." }, { status: 400 });
    }
  }

  if (!("status" in update) && !("estimated_delivery_on" in update)) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await admin.from("orders").update(update).eq("id", id);
  if (error) return Response.json({ error: "The order could not be updated." }, { status: 500 });

  return Response.json({ updated: true });
}
