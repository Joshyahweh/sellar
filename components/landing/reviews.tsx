import { connection } from "next/server";
import { Suspense } from "react";
import { ReviewsSection } from "@/components/landing/review-cards";
import { ReviewsSkeleton } from "@/components/landing/section-skeletons";
import { listReviews } from "@/lib/reviews.server";
import { createClient } from "@/lib/supabase/server";

async function LiveReviews() {
  await connection();
  const reviews = await listReviews();
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    signedIn = false;
  }
  return <ReviewsSection reviews={reviews} signedIn={signedIn} />;
}

export function Reviews() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <LiveReviews />
    </Suspense>
  );
}
