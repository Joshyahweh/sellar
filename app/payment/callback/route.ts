import { NextResponse } from "next/server";
import { confirmPaystackReference } from "@/lib/paystack";
import { getSiteOrigin } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");
  const site = await getSiteOrigin();

  if (!reference) {
    return NextResponse.redirect(new URL("/payment", site));
  }

  const result = await confirmPaystackReference(reference);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/payment?error=${encodeURIComponent(result.message)}`, site),
    );
  }

  return NextResponse.redirect(new URL("/payment/success", site));
}
