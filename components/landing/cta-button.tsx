import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const primaryClassName =
  "inline-flex h-[52px] shrink-0 cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border-0 bg-[#296cf0] px-4 py-[12px] font-semibold text-[15px] leading-[normal] whitespace-nowrap text-white sm:px-[22px] sm:text-[16px]";

const outlineClassName =
  "inline-flex h-[52px] shrink-0 cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border border-solid border-[#296cf0] bg-[#f8fdf8] px-4 py-[12px] font-semibold text-[15px] leading-[normal] whitespace-nowrap text-[#048bdc] sm:px-[22px] sm:text-[16px]";

type CtaButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "outline";
};

export function CtaButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: CtaButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        variant === "outline" ? outlineClassName : primaryClassName,
        className,
      )}
      {...props}
    />
  );
}

type CtaLinkProps = ComponentProps<"a"> & {
  variant?: "primary" | "outline";
};

export function CtaLink({
  variant = "primary",
  className,
  ...props
}: CtaLinkProps) {
  return (
    <a
      className={cn(
        variant === "outline" ? outlineClassName : primaryClassName,
        className,
      )}
      {...props}
    />
  );
}
