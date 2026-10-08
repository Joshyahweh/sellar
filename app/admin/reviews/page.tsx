import { Suspense } from "react";
import { AdminListSkeleton } from "@/components/admin/page-skeletons";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { requireAdminPage } from "@/lib/admin/guard";
import { loadReviews } from "@/lib/admin/store";

export const metadata = { title: "Reviews" };

async function ReviewsPage() {
  const { admin } = await requireAdminPage();
  const reviews = await loadReviews(admin);
  return <ReviewsManager reviews={reviews} />;
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<AdminListSkeleton columns={5} />}>
      <ReviewsPage />
    </Suspense>
  );
}
