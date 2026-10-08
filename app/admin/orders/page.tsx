import { Suspense } from "react";
import { OrdersManager } from "@/components/admin/orders-manager";
import { AdminOrdersSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { pageOrders } from "@/lib/admin/pages";

export const metadata = { title: "Orders" };

async function OrdersPage() {
  const { admin } = await requireAdminPage();
  const firstPage = await pageOrders(admin, { page: 0, q: "", status: "", kind: "", from: null, to: null });
  return <OrdersManager firstPage={firstPage} />;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminOrdersSkeleton />}>
      <OrdersPage />
    </Suspense>
  );
}
