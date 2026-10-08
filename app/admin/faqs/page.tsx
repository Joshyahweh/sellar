import { Suspense } from "react";
import { FaqsManager } from "@/components/admin/faqs-manager";
import { AdminListSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { loadFaqs } from "@/lib/admin/store";

export const metadata = { title: "FAQs" };

async function FaqsPage() {
  const { admin } = await requireAdminPage();
  const faqs = await loadFaqs(admin);
  return <FaqsManager faqs={faqs} />;
}

export default function AdminFaqsPage() {
  return (
    <Suspense fallback={<AdminListSkeleton columns={4} />}>
      <FaqsPage />
    </Suspense>
  );
}
