import { isUuid, requireAdmin } from "@/lib/api/admin";
import { coverPublicUrl } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";

const bucket = "covers";
const maxBytes = 8 * 1024 * 1024;
const slots = ["front", "back", "design"] as const;

type CoverSlot = (typeof slots)[number];

const columns: Record<CoverSlot, "front_cover_path" | "back_cover_path" | "design_cover_path"> = {
  front: "front_cover_path",
  back: "back_cover_path",
  design: "design_cover_path",
};

function imageType(bytes: Buffer) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: "png", contentType: "image/png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Product not found." }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Send the cover images as form data." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, front_cover_path, back_cover_path, design_cover_path")
    .eq("id", id)
    .maybeSingle();

  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });

  const updates: Partial<Record<(typeof columns)[CoverSlot], string>> = {};
  const replaced: string[] = [];

  for (const slot of slots) {
    const file = form.get(slot);
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > maxBytes) {
      return Response.json({ error: "Each cover image must be under 8 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = imageType(bytes);
    if (!detected) {
      return Response.json({ error: "Cover images must be PNG, JPG, or WebP." }, { status: 400 });
    }

    const path = `${id}/${slot}.${detected.ext}`;
    const { error: uploadError } = await admin.storage.from(bucket).upload(path, bytes, {
      contentType: detected.contentType,
      upsert: true,
    });
    if (uploadError) {
      return Response.json({ error: "The cover image could not be stored." }, { status: 500 });
    }

    const previous = product[columns[slot]];
    if (typeof previous === "string" && previous.length > 0 && previous !== path) replaced.push(previous);
    updates[columns[slot]] = path;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Choose a front, back, or design cover to upload." }, { status: 400 });
  }

  const { error: updateError } = await admin.from("products").update(updates).eq("id", id);
  if (updateError) {
    return Response.json({ error: "The images were stored, but the book could not be updated." }, { status: 500 });
  }

  if (replaced.length > 0) await admin.storage.from(bucket).remove(replaced);

  return Response.json(
    {
      frontCoverUrl: coverPublicUrl(updates.front_cover_path ?? product.front_cover_path),
      backCoverUrl: coverPublicUrl(updates.back_cover_path ?? product.back_cover_path),
      designCoverUrl: coverPublicUrl(updates.design_cover_path ?? product.design_cover_path),
    },
    { status: 201 },
  );
}
