import { isUuid, readJson, requireAdmin } from "@/lib/api/admin";
import type { ProductKind } from "@/lib/orders";
import { mapProduct, productSelect, productUpdateFromInput } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

function mapped(row: {
  id: unknown;
  slug: unknown;
  name: unknown;
  description: unknown;
  price_kobo: unknown;
  delivery_fee_kobo: unknown;
  kind: unknown;
  front_cover_path?: unknown;
  back_cover_path?: unknown;
  design_cover_path?: unknown;
  file_path?: unknown;
  is_display?: unknown;
  about?: unknown;
}) {
  return mapProduct({
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
    is_display: Boolean(row.is_display),
    about: row.about ? String(row.about) : "",
  });
}

async function findProduct(id: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("products").select(productSelect).eq("id", id).maybeSingle();
  return data;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Product not found." }, { status: 404 });

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;

  const existing = await findProduct(id);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });

  if (parsedBody.body.display === true) {
    const admin = createAdminClient();
    const { error: clearError } = await admin.from("products").update({ is_display: false }).neq("id", id);
    if (clearError) {
      return Response.json({ error: "The display book could not be updated." }, { status: 500 });
    }
    const { data, error } = await admin
      .from("products")
      .update({ is_display: true })
      .eq("id", id)
      .select(productSelect)
      .single();
    if (error || !data) {
      return Response.json({ error: "The display book could not be updated." }, { status: 500 });
    }
    return Response.json({ product: mapped(data) });
  }

  const current = mapped(existing);
  const parsed = productUpdateFromInput(current, parsedBody.body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  if (parsed.product.slug !== current.slug) {
    const { data: clash } = await admin
      .from("products")
      .select("id")
      .eq("slug", parsed.product.slug)
      .neq("id", id)
      .maybeSingle();
    if (clash) {
      return Response.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
  }

  const { data, error } = await admin
    .from("products")
    .update(parsed.product)
    .eq("id", id)
    .select(productSelect)
    .single();

  if (error || !data) return Response.json({ error: "The product could not be updated." }, { status: 500 });
  return Response.json({ product: mapped(data) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(_request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Product not found." }, { status: 404 });

  const admin = createAdminClient();
  const existing = await findProduct(id);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });

  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (count) {
    return Response.json(
      { error: "This book has orders, so it cannot be deleted." },
      { status: 409 },
    );
  }

  const covers = [existing.front_cover_path, existing.back_cover_path, existing.design_cover_path].filter(
    (path): path is string => typeof path === "string" && path.length > 0,
  );
  if (covers.length > 0) await admin.storage.from("covers").remove(covers);
  if (typeof existing.file_path === "string" && existing.file_path) {
    await admin.storage.from("ebooks").remove([existing.file_path]);
  }

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return Response.json({ error: "The product could not be deleted." }, { status: 500 });
  return Response.json({ deleted: true });
}
