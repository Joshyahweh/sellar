import { Suspense } from "react";
import { PlaceOrderModal } from "@/components/checkout/place-order-modal";
import { LandingPage } from "@/components/landing/landing-page";
import { latestDeliveryAddress } from "@/lib/orders.server";

async function PlaceOrderGate({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; edit?: string; order?: string }>;
}) {
  const { format, edit, order } = await searchParams;
  const slug = format && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(format) ? format : "hard-copy";
  const orderId = order && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(order) ? order : null;
  const previous = slug === "e-copy" ? null : await latestDeliveryAddress();
  return (
    <PlaceOrderModal
      format={slug}
      previous={previous}
      startEditing={edit === "1"}
      orderId={orderId}
    />
  );
}

export default function PlaceOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; edit?: string; order?: string }>;
}) {
  return (
    <>
      <LandingPage signedIn />
      <Suspense fallback={null}>
        <PlaceOrderGate searchParams={searchParams} />
      </Suspense>
    </>
  );
}
