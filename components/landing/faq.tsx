import { Suspense } from "react";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { FaqSkeleton } from "@/components/landing/section-skeletons";
import { listFaqs } from "@/lib/faqs.server";

async function LiveFaqs() {
  const faqs = await listFaqs();
  return <FaqAccordion faqs={faqs} />;
}

export function Faq() {
  return (
    <Suspense fallback={<FaqSkeleton />}>
      <LiveFaqs />
    </Suspense>
  );
}
