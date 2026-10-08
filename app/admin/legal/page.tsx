import { Suspense } from "react";
import { LegalManager } from "@/components/admin/legal-manager";
import { AdminListSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { loadLegalPages } from "@/lib/admin/store";

export const metadata = { title: "Legal pages" };

async function LegalPage() {
  const { admin } = await requireAdminPage();
  const pages = await loadLegalPages(admin);
  return <LegalManager pages={pages} />;
}

export default function AdminLegalPage() {
  return (
    <Suspense fallback={<AdminListSkeleton columns={3} />}>
      <LegalPage />
    </Suspense>
  );
}
