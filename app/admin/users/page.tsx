import { Suspense } from "react";
import { AdminUsersSkeleton } from "@/components/admin/page-skeletons";
import { UsersManager } from "@/components/admin/users-manager";
import { requireAdminPage } from "@/lib/admin/guard";
import { pageUsers } from "@/lib/admin/pages";

export const metadata = { title: "Users" };

async function UsersPage() {
  const { admin } = await requireAdminPage();
  const firstPage = await pageUsers(admin, { page: 0, q: "", purchased: "" });
  return <UsersManager firstPage={firstPage} />;
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <UsersPage />
    </Suspense>
  );
}
