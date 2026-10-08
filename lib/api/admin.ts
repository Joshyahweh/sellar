import { timingSafeEqual } from "node:crypto";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function hasServiceRoleBearer(request: Request) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function requireAdmin(request: Request) {
  if (hasServiceRoleBearer(request)) return null;

  if (!hasSupabaseEnv()) {
    return Response.json(
      { error: "Add the Supabase keys before changing this content." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return Response.json({ error: "Not authorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return Response.json({ error: "Admin access is required." }, { status: 403 });
    }
  } catch {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  return null;
}

export async function readJson(request: Request) {
  try {
    return { body: (await request.json()) as Record<string, unknown> };
  } catch {
    return { error: Response.json({ error: "Send a JSON body." }, { status: 400 }) };
  }
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
