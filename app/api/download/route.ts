import { NextResponse } from "next/server";
import { hasPaidEcopy } from "@/lib/orders.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bucket = "ebooks";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "e-copy";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(format)) {
    return new Response("That e-book is not available.", { status: 404 });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return new Response("Sign in required", { status: 401 });
  }

  if (!(await hasPaidEcopy(format))) {
    return new Response("Payment required", { status: 403 });
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("file_path, kind")
    .eq("slug", format)
    .maybeSingle();

  if (!product || product.kind !== "e_copy" || !product.file_path) {
    return new Response("The e-copy file has not been uploaded yet.", { status: 404 });
  }

  const { data: signed, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(product.file_path, 120);

  if (error || !signed?.signedUrl) {
    return new Response("The e-copy file has not been uploaded yet.", { status: 404 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
