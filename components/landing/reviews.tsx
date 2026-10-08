import { Suspense } from "react";
import { ReviewsSection } from "@/components/landing/review-cards";
import { ReviewsSkeleton } from "@/components/landing/section-skeletons";
import { listReviews } from "@/lib/reviews.server";

async function LiveReviews() {
  const reviews = await listReviews();
  return <ReviewsSection reviews={reviews} />;
}

export function Reviews() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <LiveReviews />
    </Suspense>
  );
}
