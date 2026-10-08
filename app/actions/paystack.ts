"use server";

import { redirect } from "next/navigation";
import { getSiteOrigin } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const channels = {
  card: "card",
  bank_transfer: "bank_transfer",
  ussd: "ussd",
  qr: "qr",
} as const;

export type PaystackChannel = keyof typeof channels;

export async function startPaystackCheckout(orderId: string, channel: PaystackChannel) {
  if (!channels[channel]) return { error: "Choose a payment method." };

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { error: "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to .env.local." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) redirect(`/sign-in?next=${encodeURIComponent(`/payment?order=${orderId}`)}`);

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, amount_kobo, status")
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error || !order) return { error: "Order not found." };
  if (order.status !== "pending") return { error: "This order has already been paid." };

  const reference = `bk_${crypto.randomUUID().replaceAll("-", "")}`;
  const admin = createAdminClient();
  const { error: referenceError } = await admin
    .from("orders")
    .update({ paystack_reference: reference, paystack_channel: channel })
    .eq("id", order.id)
    .eq("status", "pending");

  if (referenceError) return { error: "We could not start this payment." };

  const site = (process.env.PAYSTACK_CALLBACK_ORIGIN || (await getSiteOrigin())).replace(/\/$/, "");
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: auth.user.email,
      amount: order.amount_kobo,
      reference,
      callback_url: `${site}/payment/callback`,
      channels: [channels[channel]],
      metadata: { order_id: order.id },
    }),
  });
  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    return { error: payload.message ?? "Paystack could not start this payment." };
  }

  return { url: payload.data.authorization_url };
}

export async function startEcopyPayment(channel: PaystackChannel, slug = "e-copy") {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "That e-book is not available yet." };
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/download?format=${slug}`)}`);

  const { data: existing } = await supabase
    .from("orders")
    .select("id, products!inner(slug)")
    .eq("user_id", auth.user.id)
    .eq("status", "pending")
    .eq("products.slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderId = existing?.id as string | undefined;

  if (!orderId) {
    const { data: product } = await supabase
      .from("products")
      .select("id, kind")
      .eq("slug", slug)
      .maybeSingle();
    if (!product || product.kind !== "e_copy") return { error: "That e-book is not available yet." };

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: auth.user.id,
        product_id: product.id,
        quantity: 1,
        amount_kobo: 0,
      })
      .select("id")
      .single();

    if (error || !data?.id) return { error: "We could not start this download order." };
    orderId = data.id;
  }

  if (!orderId) return { error: "We could not start this download order." };
  return startPaystackCheckout(orderId, channel);
}
