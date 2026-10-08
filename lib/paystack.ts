import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type VerifyResult =
  | { ok: true; orderId: string }
  | { ok: false; message: string };

type PaystackVerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    status?: string;
    amount?: number;
    reference?: string;
    channel?: string;
    paid_at?: string;
  };
};

export async function confirmPaystackReference(reference: string): Promise<VerifyResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { ok: false, message: "Paystack is not configured yet." };
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !payload.status || payload.data?.status !== "success") {
    return { ok: false, message: payload.message ?? "Payment was not successful." };
  }

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, amount_kobo, status, products(kind)")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, message: "No order matches this payment." };
  }

  if (payload.data.amount !== order.amount_kobo) {
    return { ok: false, message: "The paid amount does not match this order." };
  }

  if (order.status === "pending") {
    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const status = product?.kind === "e_copy" ? "delivered" : "awaiting";
    const paidAt = payload.data.paid_at ?? new Date().toISOString();

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status,
        paid_at: paidAt,
        paystack_channel: payload.data.channel ?? null,
      })
      .eq("id", order.id);

    if (updateError) {
      return { ok: false, message: "Payment was received, but the order could not be updated." };
    }

    await admin.from("payments").upsert(
      {
        order_id: order.id,
        reference,
        amount_kobo: payload.data.amount,
        status: "success",
        channel: payload.data.channel ?? null,
        paid_at: paidAt,
      },
      { onConflict: "reference" },
    );
  }

  return { ok: true, orderId: order.id };
}

export function isValidPaystackSignature(rawBody: string, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const left = Buffer.from(signature);
  const right = Buffer.from(digest);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
