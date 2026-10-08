import { Suspense } from "react";
import { Footer } from "@/components/landing/footer";
import { HeaderNav } from "@/components/landing/header-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { legalParagraphs, legalUpdatedLabel, type LegalSlug } from "@/lib/legal";
import { getLegalPage } from "@/lib/legal.server";

function LegalSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] bg-[#fdfdfd]">
      <section className="px-5 pt-8 pb-16 desk:px-[192px] desk:pt-[140px]">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 flex max-w-[820px] flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </section>
    </div>
  );
}

async function LegalBody({ slug }: { slug: LegalSlug }) {
  const page = await getLegalPage(slug);
  const updated = legalUpdatedLabel(page.updatedAt);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] bg-[#fdfdfd]">
      <HeaderNav />
      <section className="relative min-h-[720px] px-5 pt-8 pb-16 desk:px-[192px] desk:pt-[140px] desk:pb-[80px]">
        <h1 className="m-0 max-w-[820px] font-semibold text-[28px] leading-[34px] text-black desk:text-[38px] desk:leading-[46px]">
          {page.title}
        </h1>
        {updated ? (
          <p className="mt-3 font-normal text-[14px] leading-[20px] text-[#a5a5a5]">Last updated {updated}</p>
        ) : null}
        <div className="mt-8 flex max-w-[820px] flex-col gap-4">
          {legalParagraphs(page.body).map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="m-0 font-normal text-[16px] leading-[26px] text-[#626262]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function LegalDocument({ slug }: { slug: LegalSlug }) {
  return (
    <Suspense fallback={<LegalSkeleton />}>
      <LegalBody slug={slug} />
    </Suspense>
  );
}
