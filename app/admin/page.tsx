import { Suspense } from "react";
import { DashboardView } from "@/components/admin/dashboard-view";
import { AdminDashboardSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { presetRange } from "@/lib/admin/range";
import { loadAdminDashboard } from "@/lib/admin/store";

export const metadata = { title: "Dashboard" };

async function Dashboard() {
  const { admin } = await requireAdminPage();
  const range = presetRange(30);
  const sales = await loadAdminDashboard(admin, range);
  return <DashboardView initialRange={range} initialSales={sales} />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
