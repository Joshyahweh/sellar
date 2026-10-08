import { Suspense } from "react";
import { AboutAuthor } from "@/components/landing/about-author";
import { AboutBook } from "@/components/landing/about-book";
import { BookFormats } from "@/components/landing/book-formats";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LandingSkeleton } from "@/components/landing/section-skeletons";
import { Reviews } from "@/components/landing/reviews";
import { catalogCovers } from "@/lib/products";
import { listBookProducts } from "@/lib/products.server";

type LandingPageProps = {
  signedIn?: boolean;
};

async function LiveLanding({ signedIn }: { signedIn: boolean }) {
  const covers = catalogCovers(await listBookProducts());
  return (
    <>
      <Hero signedIn={signedIn} frontCover={covers.front} backCover={covers.back} />
      <BookFormats signedIn={signedIn} />
      <Reviews />
      <AboutAuthor />
      <Faq />
      <AboutBook designCover={covers.design} />
      <Footer />
    </>
  );
}

export function LandingPage({ signedIn = false }: LandingPageProps) {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] bg-[#fdfdfd]">
      <Suspense fallback={<LandingSkeleton />}>
        <LiveLanding signedIn={signedIn} />
      </Suspense>
    </div>
  );
}
