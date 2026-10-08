import Image from "next/image";
import { ArrowDownIcon } from "@/components/icons";
import { BookCover } from "@/components/landing/book-cover";
import { CtaLink } from "@/components/landing/cta-button";
import { HeaderNav } from "@/components/landing/header-nav";

type HeroProps = {
  signedIn?: boolean;
  frontCover?: string | null;
  backCover?: string | null;
};

export function Hero({ signedIn = false, frontCover = null, backCover = null }: HeroProps) {
  return (
    <section className="relative w-full shrink-0 overflow-x-clip desk:h-[923px] desk:overflow-clip">
      <HeaderNav variant={signedIn ? "signedIn" : "unsigned"} />
      <div className="flex w-full flex-col items-center gap-5 px-5 pt-8 pb-10 desk:absolute desk:top-[140px] desk:left-1/2 desk:w-[902px] desk:-translate-x-1/2 desk:gap-[20px] desk:px-0 desk:pt-0 desk:pb-0">
        <div className="flex w-full max-w-[707px] flex-col items-center gap-5 desk:w-[707px] desk:gap-[20px]">
          <div className="flex w-full flex-col items-center gap-3 desk:gap-[12px]">
            <div className="flex w-full flex-col items-center gap-2 text-center font-semibold text-black desk:gap-[8px]">
              <p className="w-full text-[14px] leading-[normal] desk:text-[16px]">
                A book by Funke Allen
              </p>
              <h1 className="m-0 w-full max-w-[441px] text-[36px] leading-[100%] desk:w-[441px] desk:text-[56px]">
                SACRED BUT FULLY KNOWN
              </h1>
            </div>
            <div className="flex w-full flex-col gap-1 text-center font-normal text-[14px] leading-[20px] text-[#626262] desk:gap-[4px] desk:text-[16px]">
              <p className="w-full whitespace-pre-wrap">{`What if the one who knows you  completely is also the one who understands you most ?`}</p>
              <p className="w-full">
                A deeply personal journey of faith, identity and personal
                discovering what it means to be fully known by God
              </p>
            </div>
          </div>
          <CtaLink href="/#formats">
            Get a copy
            <ArrowDownIcon size={24} color="#ffffff" />
          </CtaLink>
        </div>
        <div className="relative h-[280px] w-full max-w-[902px] shrink-0 sm:h-[360px] desk:h-[448.181px]">
          <div className="absolute inset-0 desk:top-0 desk:left-1/2 desk:h-[448.181px] desk:w-[902px] desk:-translate-x-1/2">
            <Image
              src="/images/hero-bg.jpg"
              alt=""
              fill
              sizes="(max-width: 1439px) 100vw, 902px"
              quality={100}
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 flex w-[calc(100%-24px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 sm:gap-5 desk:w-auto desk:gap-[20px]">
            <div className="relative h-[200px] w-[48%] max-w-[397px] shrink-0 overflow-clip bg-[rgba(255,255,255,0.62)] sm:h-[280px] desk:h-[392px] desk:w-[397px]">
              <p className="absolute top-[calc(50%-11px)] left-[calc(50%+1px)] -translate-x-1/2 text-center font-normal text-[14px] leading-[normal] whitespace-nowrap text-black desk:text-[18px]">
                Front cover
              </p>
              <BookCover
                src={frontCover}
                width={185.313}
                height={258}
                alt="Front cover"
                className="absolute top-1/2 left-1/2 w-[110px] -translate-x-1/2 -translate-y-1/2 sm:w-[160px] desk:w-[185.313px]"
              />
            </div>
            <div className="relative h-[200px] w-[48%] max-w-[397px] shrink-0 overflow-clip bg-[rgba(255,255,255,0.62)] sm:h-[280px] desk:h-[392px] desk:w-[397px]">
              <p className="absolute top-[calc(50%-11px)] left-[calc(50%+1px)] -translate-x-1/2 text-center font-normal text-[14px] leading-[normal] whitespace-nowrap text-black desk:text-[18px]">
                Back cover
              </p>
              {backCover ? (
                <BookCover
                  src={backCover}
                  width={185.313}
                  height={258}
                  alt="Back cover"
                  className="absolute top-1/2 left-1/2 w-[110px] -translate-x-1/2 -translate-y-1/2 sm:w-[160px] desk:w-[185.313px]"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
