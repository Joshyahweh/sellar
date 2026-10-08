import { isUuid, requireAdmin } from "@/lib/api/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const bucket = "ebooks";
const maxBytes = 50 * 1024 * 1024;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!isUuid(id)) return Response.json({ error: "Product not found." }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Send the PDF as form data in the file field." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Attach the e-book PDF in the file field." }, { status: 400 });
  }
  if (file.size < 5 || file.size > maxBytes) {
    return Response.json({ error: "The PDF must be under 50 MB." }, { status: 400 });
  }
  if (file.type && file.type !== "application/pdf") {
    return Response.json({ error: "Upload a PDF file." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!bytes.subarray(0, 5).toString("utf8").startsWith("%PDF")) {
    return Response.json({ error: "Upload a PDF file." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, slug, kind")
    .eq("id", id)
    .maybeSingle();

  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  if (product.kind !== "e_copy") {
    return Response.json({ error: "Only an e-book can have a download file." }, { status: 400 });
  }

  const filePath = `${product.slug}.pdf`;
  const { error: uploadError } = await admin.storage.from(bucket).upload(filePath, bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    return Response.json({ error: "The e-book could not be stored." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("products")
    .update({ file_path: filePath })
    .eq("id", product.id);

  if (updateError) {
    return Response.json({ error: "The file was stored, but the book could not be updated." }, { status: 500 });
  }

  return Response.json({ filePath }, { status: 201 });
}
