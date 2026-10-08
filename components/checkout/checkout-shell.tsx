import type { ReactNode } from "react";
import { InfoCircleIcon } from "@/components/icons";
import { HeaderNav } from "@/components/landing/header-nav";

type CheckoutShellProps = {
  children: ReactNode;
  showPayBanner?: boolean;
};

export function CheckoutShell({
  children,
  showPayBanner = false,
}: CheckoutShellProps) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] overflow-x-hidden bg-[#fdfdfd] desk:h-[923px] desk:overflow-clip">
      <HeaderNav variant="checkout" />
      {showPayBanner ? (
        <div className="relative z-[1] mx-4 mt-3 flex items-start gap-[8px] rounded-[8px] bg-[#e8c547] px-4 py-3 desk:absolute desk:top-[118px] desk:left-1/2 desk:mx-0 desk:mt-0 desk:h-[40px] desk:w-[560px] desk:-translate-x-1/2 desk:items-center desk:py-0 desk:px-[16px]">
          <InfoCircleIcon size={20} color="#14181b" className="shrink-0" />
          <p className="font-normal text-[12px] leading-[15px] text-[#14181b]">
            Kindly make payment before we can be able to let you download our
            E-copy
          </p>
        </div>
      ) : null}
      <div className="flex items-start justify-center px-4 py-6 desk:absolute desk:inset-0 desk:items-center desk:px-0 desk:py-0">
        {children}
      </div>
    </div>
  );
}
