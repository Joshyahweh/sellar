import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase/env";
import { defaultBookProducts, mapProduct, productSelect, type BookProduct } from "@/lib/products";
import type { ProductKind } from "@/lib/orders";

function sortProducts(products: BookProduct[]) {
  return [...products].sort((left, right) => {
    const kindOrder = Number(left.kind === "e_copy") - Number(right.kind === "e_copy");
    if (kindOrder !== 0) return kindOrder;
    return left.name.localeCompare(right.name);
  });
}

export async function listBookProducts(): Promise<BookProduct[]> {
  if (!hasSupabaseEnv()) return defaultBookProducts;

  const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.from("products").select(productSelect);

  if (error || !data?.length) return defaultBookProducts;

  return sortProducts(
    data.map((row) =>
      mapProduct({
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name),
        description: row.description ? String(row.description) : "",
        price_kobo: Number(row.price_kobo),
        delivery_fee_kobo: Number(row.delivery_fee_kobo),
        kind: row.kind as ProductKind,
        front_cover_path: row.front_cover_path ? String(row.front_cover_path) : null,
        back_cover_path: row.back_cover_path ? String(row.back_cover_path) : null,
        design_cover_path: row.design_cover_path ? String(row.design_cover_path) : null,
        file_path: row.file_path ? String(row.file_path) : null,
      }),
    ),
  );
}
