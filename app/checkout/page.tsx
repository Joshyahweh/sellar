import { Suspense } from "react";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { CheckoutCardSkeleton } from "@/components/landing/section-skeletons";
import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { getPendingOrder } from "@/lib/orders.server";
import { listBookProducts } from "@/lib/products.server";
import Link from "next/link";

async function CheckoutGate({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = await getPendingOrder(orderId).catch(() => null);

  if (!order) {
    return (
      <div className="relative z-[2] w-full max-w-[480px] rounded-[16px] bg-white px-5 py-8 text-center shadow-[0_8px_32px_rgba(20,24,27,0.08)]">
        <p className="font-medium text-[16px] leading-[22px] text-[#14181b]">
          There is no unpaid order yet.
        </p>
        <Link href="/place-order?format=hard-copy" className="mt-4 inline-block font-semibold text-[16px] text-[#296cf0]">
          Place an order
        </Link>
      </div>
    );
  }

  const products = await listBookProducts().catch(() => []);
  const product = products.find((item) => item.slug === order.productSlug);
  return <CheckoutModal order={order} coverUrl={product?.designCoverUrl || product?.frontCoverUrl} />;
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <CheckoutShell>
      <Suspense fallback={<CheckoutCardSkeleton />}>
        <CheckoutGate searchParams={searchParams} />
      </Suspense>
    </CheckoutShell>
  );
}
