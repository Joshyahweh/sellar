import { Suspense } from "react";
import { EnquiriesManager } from "@/components/admin/enquiries-manager";
import { AdminListSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { pageEnquiries } from "@/lib/admin/pages";

export const metadata = { title: "Messages" };

async function EnquiriesPage() {
  const { admin } = await requireAdminPage();
  const firstPage = await pageEnquiries(admin, { page: 0, q: "" });
  return <EnquiriesManager firstPage={firstPage} />;
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={<AdminListSkeleton columns={4} />}>
      <EnquiriesPage />
    </Suspense>
  );
}
