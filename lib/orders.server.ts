import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOrder, orderSelect, type CustomerOrder, type DeliveryAddress, type OrderRow } from "@/lib/orders";

export async function listMyOrders(): Promise<CustomerOrder[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as OrderRow[]).map(mapOrder);
}

export async function getPendingOrder(orderId?: string): Promise<CustomerOrder | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  let query = supabase
    .from("orders")
    .select(orderSelect)
    .eq("user_id", auth.user.id)
    .eq("status", "pending");

  if (orderId) {
    query = query.eq("id", orderId);
  } else {
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return mapOrder(data as unknown as OrderRow);
}

export async function latestDeliveryAddress(): Promise<DeliveryAddress | null> {
  await connection();
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("country, state, town, landmark, phone")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data) return null;

  for (const row of data) {
    const address = {
      country: String(row.country ?? "").trim(),
      state: String(row.state ?? "").trim(),
      town: String(row.town ?? "").trim(),
      landmark: String(row.landmark ?? "").trim(),
      phone: String(row.phone ?? "").trim(),
    };
    if (address.country && address.state && address.town && address.landmark && address.phone.length >= 7) {
      return address;
    }
  }

  return null;
}

export async function hasPaidEcopy(slug = "e-copy") {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data, error } = await supabase
    .from("orders")
    .select("id, products!inner(slug, kind)")
    .eq("user_id", auth.user.id)
    .eq("status", "delivered")
    .eq("products.slug", slug)
    .eq("products.kind", "e_copy")
    .limit(1);

  if (error || !data?.length) return false;
  return true;
}
