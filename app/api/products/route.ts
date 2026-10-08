import { readJson, requireAdmin } from "@/lib/api/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  defaultBookProducts,
  mapProduct,
  normalizeProductKind,
  productFromInput,
  productSelect,
} from "@/lib/products";
import { listBookProducts } from "@/lib/products.server";
import type { ProductKind } from "@/lib/orders";

export async function GET() {
  const products = await listBookProducts();
  return Response.json({ products });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const parsedBody = await readJson(request);
  if ("error" in parsedBody) return parsedBody.error;
  const body = parsedBody.body;

  const kind = normalizeProductKind(body.kind);
  if (!kind) {
    return Response.json(
      { error: "kind must be e-book or hard-copy." },
      { status: 400 },
    );
  }

  const parsed = productFromInput({
    kind,
    name: body.name,
    description: body.description,
    slug: body.slug,
    priceKobo: body.priceKobo,
    priceNaira: body.priceNaira,
    deliveryFeeKobo: body.deliveryFeeKobo,
    deliveryFeeNaira: body.deliveryFeeNaira,
  });
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("products")
    .select(productSelect)
    .eq("slug", parsed.product.slug)
    .maybeSingle();

  if (existing) {
    return Response.json(
      {
        error: "A product with this slug already exists.",
        product: mapProduct({
          id: String(existing.id),
          slug: String(existing.slug),
          name: String(existing.name),
          description: existing.description ? String(existing.description) : "",
          price_kobo: Number(existing.price_kobo),
          delivery_fee_kobo: Number(existing.delivery_fee_kobo),
          kind: existing.kind as ProductKind,
          front_cover_path: existing.front_cover_path ? String(existing.front_cover_path) : null,
          back_cover_path: existing.back_cover_path ? String(existing.back_cover_path) : null,
          design_cover_path: existing.design_cover_path ? String(existing.design_cover_path) : null,
          file_path: existing.file_path ? String(existing.file_path) : null,
        }),
      },
      { status: 409 },
    );
  }

  const { data, error } = await admin
    .from("products")
    .insert(parsed.product)
    .select(productSelect)
    .single();

  if (error || !data) {
    return Response.json({ error: "The product could not be created." }, { status: 500 });
  }

  return Response.json(
    {
      product: mapProduct({
        id: String(data.id),
        slug: String(data.slug),
        name: String(data.name),
        description: data.description ? String(data.description) : "",
        price_kobo: Number(data.price_kobo),
        delivery_fee_kobo: Number(data.delivery_fee_kobo),
        kind: data.kind as ProductKind,
        front_cover_path: data.front_cover_path ? String(data.front_cover_path) : null,
        back_cover_path: data.back_cover_path ? String(data.back_cover_path) : null,
        design_cover_path: data.design_cover_path ? String(data.design_cover_path) : null,
        file_path: data.file_path ? String(data.file_path) : null,
      }),
    },
    { status: 201 },
  );
}

export function OPTIONS() {
  return Response.json({
    defaults: defaultBookProducts,
    kinds: ["e-book", "hard-copy"],
  });
}
