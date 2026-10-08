import { listLegalPages } from "@/lib/legal.server";

export async function GET() {
  const pages = await listLegalPages();
  return Response.json({ pages });
}
