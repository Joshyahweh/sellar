import { confirmPaystackReference, isValidPaystackSignature } from "@/lib/paystack";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!isValidPaystackSignature(raw, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    await confirmPaystackReference(event.data.reference);
  }

  return Response.json({ received: true });
}
