import { headers } from "next/headers";

const hits = new Map<string, number[]>();

export const rateLimited = { error: "Too many attempts. Try again in a few minutes." };

async function clientIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerStore.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export async function allowRequest(scope: string, max: number, windowMs: number) {
  const key = `${scope}:${await clientIp()}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}
