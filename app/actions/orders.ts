"use server";

import { redirect } from "next/navigation";
import { mapOrder, orderSelect, type OrderRow } from "@/lib/orders";
import { allowRequest, rateLimited } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function createOrder(formData: FormData): Promise<{ error?: string; ok?: boolean } | void> {
  const format = String(formData.get("format") ?? "hard-copy");
  const country = String(formData.get("country") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const town = String(formData.get("town") ?? "").trim();
  const landmark = String(formData.get("landmark") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(format)) return { error: "Choose a book format." };

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Supabase is not configured." };
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/place-order?format=${format}`)}`);

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, kind")
    .eq("slug", format)
    .maybeSingle();

  if (productError || !product) return { error: "That book format is not available yet." };
  if (
    product.kind === "hard_copy" &&
    (!country || !state || !town || !landmark || phone.length < 7)
  ) {
    return { error: "Enter the full delivery address and phone number." };
  }

  const stayOnProfile = String(formData.get("stay") ?? "").trim() === "profile";
  const orderId = String(formData.get("order") ?? "").trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ country, state, town, landmark, phone })
      .eq("id", orderId)
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (updateError || !updated) return { error: "This order can no longer be changed." };
    if (stayOnProfile) return { ok: true };
    redirect(`/checkout?order=${updated.id}`);
  }

  if (stayOnProfile) {
    const { data: pending } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!pending?.id) {
      return { error: "Save this address when you place a hard-copy order." };
    }
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ country, state, town, landmark, phone })
      .eq("id", pending.id)
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (updateError || !updated) return { error: "This order can no longer be changed." };
    return { ok: true };
  }

  if (!(await allowRequest("create-order", 20, 15 * 60 * 1000))) return rateLimited;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: auth.user.id,
      product_id: product.id,
      quantity: 1,
      amount_kobo: 0,
      country,
      state,
      town,
      landmark,
      phone,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "We could not save this order." };
  redirect(`/checkout?order=${data.id}`);
}

export async function updateOrderQuantity(orderId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return { error: "Quantity must be between 1 and 99." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/sign-in?next=/checkout");

  const { data, error } = await supabase
    .from("orders")
    .update({ quantity })
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .eq("status", "pending")
    .select(orderSelect)
    .maybeSingle();

  if (error || !data) return { error: "This order can no longer be changed." };
  return { order: mapOrder(data as unknown as OrderRow) };
}
