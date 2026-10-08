import { connection } from "next/server";
import { Suspense } from "react";
import { BookCover } from "@/components/landing/book-cover";
import { FormatsSkeleton } from "@/components/landing/section-skeletons";
import { PlaceOrderButton } from "@/components/checkout/place-order-button";
import { CtaLink } from "@/components/landing/cta-button";
import { formatNgn } from "@/lib/money";
import type { DeliveryAddress } from "@/lib/orders";
import { latestDeliveryAddress } from "@/lib/orders.server";
import type { BookProduct } from "@/lib/products";
import { listBookProducts } from "@/lib/products.server";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

function FormatThumbnail({ src }: { src?: string | null }) {
  return (
    <div className="relative h-[180px] w-full max-w-[158px] shrink-0 overflow-clip bg-[#021a28] sm:h-[184px] sm:w-[158px]">
      <BookCover
        src={src}
        width={113}
        height={157}
        className="absolute top-[11px] left-[12px] sm:left-[23px]"
      />
    </div>
  );
}

function FormatGrid({
  products,
  previous,
}: {
  products: BookProduct[];
  previous: DeliveryAddress | null;
}) {
  const fitsDesktopFrame = products.length <= 2;

  return (
    <section
      id="formats"
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-[#f8f8f8] px-5 py-10",
        fitsDesktopFrame ? "desk:h-[426px] desk:overflow-clip desk:px-0 desk:py-0" : "desk:px-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1132px] flex-col items-start gap-5 desk:w-[1132px] desk:gap-[20px]",
          fitsDesktopFrame
            ? "desk:absolute desk:top-1/2 desk:left-1/2 desk:-translate-x-1/2 desk:-translate-y-1/2"
            : "desk:relative desk:mx-auto desk:py-10",
        )}
      >
        <h2 className="m-0 w-full font-normal text-[24px] leading-[normal] text-[#626262] desk:h-[38px] desk:w-[434px] desk:text-[32px] desk:whitespace-nowrap">
          Get you preferred book format
        </h2>
        <div className="flex w-full flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center md:gap-1 desk:gap-[4px]">
          {products.map((product) => (
            <article
              key={product.slug}
              className="flex w-full flex-col items-start overflow-clip border border-solid border-[#f5f5f5] bg-white p-4 sm:p-[20px] md:w-[calc(50%-2px)] desk:w-[564px] desk:shrink-0"
            >
              <div className="flex w-full flex-col items-start gap-3 sm:flex-row desk:gap-[12px]">
                <FormatThumbnail src={product.designCoverUrl || product.frontCoverUrl} />
                <div className="flex min-w-0 flex-col items-start gap-2 p-0 sm:gap-[10px] sm:p-[10px]">
                  <p className="font-medium text-[16px] leading-[normal] text-black sm:text-[18px]">
                    {product.name}
                  </p>
                  <p className="font-normal text-[14px] leading-[normal] text-[#a5a5a5] sm:text-[16px]">
                    {product.description}
                  </p>
                  <p className="font-bold text-[16px] leading-[normal] whitespace-nowrap text-black sm:text-[18px]">
                    {formatNgn(product.priceKobo)}
                  </p>
                  {product.kind === "hard_copy" ? (
                    <PlaceOrderButton format={product.slug} previous={previous} />
                  ) : (
                    <CtaLink href={`/download?format=${product.slug}`}>Pay and Download</CtaLink>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

async function LiveFormats({ signedIn }: { signedIn: boolean }) {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const hasSession = signedIn || Boolean(data.user);
  const products = await listBookProducts();
  const previous = hasSession ? await latestDeliveryAddress() : null;
  return <FormatGrid products={products} previous={previous} />;
}

export function BookFormats({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <Suspense fallback={<FormatsSkeleton />}>
      <LiveFormats signedIn={signedIn} />
    </Suspense>
  );
}
