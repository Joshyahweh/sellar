import { Suspense } from "react";
import { CardPaymentModal } from "@/components/checkout/payment-modals";
import { CheckoutCardSkeleton } from "@/components/landing/section-skeletons";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { formatNgn } from "@/lib/money";
import { getPendingOrder } from "@/lib/orders.server";

async function CardGate({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = await getPendingOrder(orderId).catch(() => null);

  return (
    <CardPaymentModal
      orderId={order?.id}
      totalLabel={order ? formatNgn(order.amountKobo) : "NGN 3,500.00"}
    />
  );
}

export default function CardPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <CheckoutShell showPayBanner>
      <Suspense fallback={<CheckoutCardSkeleton />}>
        <CardGate searchParams={searchParams} />
      </Suspense>
    </CheckoutShell>
  );
}
