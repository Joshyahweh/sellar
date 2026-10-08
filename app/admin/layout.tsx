import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminShellSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";

async function AdminGate({ children }: { children: React.ReactNode }) {
  const { name } = await requireAdminPage();
  return <AdminShell name={name}>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
