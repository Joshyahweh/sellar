import { Suspense } from "react";
import { AccountPageSkeleton } from "@/components/landing/section-skeletons";
import { OrdersView } from "@/components/orders/orders-view";
import { listMyOrders } from "@/lib/orders.server";

async function OrdersGate() {
  const orders = await listMyOrders().catch(() => []);
  return <OrdersView orders={orders} />;
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton titleWidth="w-28" />}>
      <OrdersGate />
    </Suspense>
  );
}
