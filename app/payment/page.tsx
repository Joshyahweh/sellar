import { Suspense } from "react";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { PaymentMethodModal } from "@/components/checkout/payment-modals";
import { CheckoutCardSkeleton } from "@/components/landing/section-skeletons";
import { getPendingOrder } from "@/lib/orders.server";

async function PaymentGate({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; error?: string }>;
}) {
  const { order: orderId, error } = await searchParams;
  const order = await getPendingOrder(orderId).catch(() => null);

  return <PaymentMethodModal orderId={order?.id} notice={error} />;
}

export default function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; error?: string }>;
}) {
  return (
    <CheckoutShell showPayBanner>
      <Suspense fallback={<CheckoutCardSkeleton />}>
        <PaymentGate searchParams={searchParams} />
      </Suspense>
    </CheckoutShell>
  );
}
