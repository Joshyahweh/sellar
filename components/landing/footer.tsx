import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/#formats", label: "Get a copy" },
  { href: "/#about-book", label: "About Book" },
  { href: "/#about-author", label: "About Author" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/delivery", label: "Delivery and returns" },
  { href: "/terms", label: "Terms of use" },
] as const;

export function Footer() {
  return (
    <footer className="relative min-h-[280px] w-full shrink-0 overflow-hidden bg-[#f9f9f9] px-5 py-10 desk:h-[334px] desk:overflow-clip desk:px-0 desk:py-0">
      <div className="absolute right-0 bottom-0 left-0 h-[640px] desk:bottom-0 desk:left-[calc(50%+0.5px)] desk:h-[986px] desk:w-[1479px] desk:-translate-x-1/2">
        <Image
          src="/images/footer-bg.png"
          alt=""
          fill
          sizes="1479px"
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="relative z-[1] mx-auto flex w-full max-w-[1206px] flex-col items-center desk:absolute desk:top-1/2 desk:left-1/2 desk:w-[1206px] desk:-translate-x-1/2 desk:-translate-y-1/2">
        <div className="flex w-full flex-col items-start gap-5 desk:gap-[20px]">
          <div className="flex w-full flex-col items-start gap-2.5 desk:gap-[10px]">
            <p className="w-full font-bold text-[20px] leading-[normal] text-[#000715]">
              Quick links
            </p>
            <div className="flex h-[65px] w-full items-center justify-center overflow-x-auto border border-solid border-[#048bdc] bg-[#296cf0]">
              <div className="flex shrink-0 flex-nowrap items-center justify-center">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-center px-2 py-[10px] font-normal text-[14px] leading-[normal] whitespace-nowrap text-white sm:px-[10px] sm:text-[16px]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-start desk:h-[123px] desk:shrink-0">
              <div className="flex items-center justify-center p-1 desk:p-[10px]">
                <p className="font-bold text-[16px] leading-[normal] text-black">
                  Lagos, Nigeria
                </p>
              </div>
              <div className="flex items-center justify-center p-1 desk:p-[10px]">
                <p className="font-normal text-[16px] leading-[normal] text-black">
                  358 Herbert Macaulay Way, Yaba, Lagos
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center p-1 desk:p-[10px]">
              <p className="font-normal text-[14px] leading-[normal] text-black sm:text-[16px] desk:whitespace-nowrap">
                2026 Sacred but fully known. All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
