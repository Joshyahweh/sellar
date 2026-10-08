"use client";

import Link from "next/link";
import { useState } from "react";
import { startEcopyPayment, type PaystackChannel } from "@/app/actions/paystack";
import { cn } from "@/lib/utils";
import {
  BuildingIcon,
  CardIcon,
  CrossIcon,
  DocumentDownloadIcon,
  InfoCircleIcon,
  MobileIcon,
  ScanBarcodeIcon,
  UnlockIcon,
} from "@/components/icons";
import { BookCover } from "@/components/landing/book-cover";
import { HeaderNav } from "@/components/landing/header-nav";

const methods = [
  { icon: CardIcon, label: "Card", channel: "card" },
  { icon: BuildingIcon, label: "Bank transfer", channel: "bank_transfer" },
  { icon: MobileIcon, label: "USSD", channel: "ussd" },
  { icon: ScanBarcodeIcon, label: "QR code", channel: "qr" },
] as const satisfies ReadonlyArray<{
  icon: typeof CardIcon;
  label: string;
  channel: PaystackChannel;
}>;

type DownloadModalProps = {
  mode?: "guest" | "pay" | "ready";
  paid?: boolean;
  format?: string;
  priceLabel?: string;
  coverUrl?: string | null;
};

export function DownloadModal({
  mode,
  paid = false,
  format = "e-copy",
  priceLabel = "NGN 3,500.00",
  coverUrl = null,
}: DownloadModalProps) {
  const resolvedMode = mode ?? (paid ? "ready" : "guest");
  const isReady = resolvedMode === "ready";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function pay(channel: PaystackChannel) {
    setPending(true);
    setError(null);
    const result = await startEcopyPayment(channel, format);
    if (result?.url) {
      window.location.assign(result.url);
      return;
    }
    setPending(false);
    setError(result?.error ?? "Paystack could not start this payment.");
  }
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] overflow-x-hidden bg-[#fdfdfd] desk:h-[923px] desk:overflow-clip">
      <HeaderNav variant={resolvedMode === "guest" ? "unsigned" : "signedIn"} />
      <div className="absolute inset-0 hidden bg-[rgba(1,27,42,0.72)] desk:block" />
      <div
        className={cn(
          "relative z-[1] mx-4 my-6 flex w-auto flex-col bg-white shadow-[0_8px_32px_rgba(20,24,27,0.08)] desk:absolute desk:left-[359px] desk:mx-0 desk:my-0 desk:w-[722px] desk:shadow-none",
          isReady ? "desk:top-[263px]" : "desk:top-[112px]",
        )}
      >
        <div className="flex w-full items-center justify-between px-5 pt-6 sm:px-[50px] sm:pt-[40px]">
          <h1 className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
            Download E-copy
          </h1>
          <Link href={isReady ? "/home" : "/"} aria-label="Close">
            <CrossIcon size={24} color="#14181b" />
          </Link>
        </div>
        <div className="mt-5 flex flex-col px-5 pb-8 sm:mt-[20px] sm:px-[50px] sm:pb-[40px]">
          {isReady ? null : (
            <div className="mb-3 flex w-full items-start gap-2 bg-[#eef6fb] px-4 py-3 sm:mb-[12px] sm:h-[47px] sm:w-[621px] sm:items-center sm:px-[25px] sm:py-0">
              <InfoCircleIcon size={24} color="#048bdc" className="shrink-0" />
              <p className="font-normal text-[14px] leading-[17px] text-[#14181b]">
                Kindly make payment before we can be able to let you download
                our E-copy
              </p>
            </div>
          )}
          <div className="flex w-full flex-col items-start gap-4 self-center border border-solid border-[#f5f5f5] bg-white p-4 sm:w-[564px] sm:flex-row sm:items-start sm:gap-[12px] sm:p-[20px]">
            <div className="relative mx-auto h-[220px] w-[158px] shrink-0 overflow-clip bg-[#021a28] sm:mx-0">
              <BookCover
                src={coverUrl}
                width={158}
                height={220}
                className="absolute inset-0"
              />
            </div>
            <div className="flex w-full flex-col items-start pt-0 sm:pt-[10px] sm:pl-[10px]">
              <p className="font-medium text-[18px] leading-[22px] text-black">
                E-copy
              </p>
              <p className="mt-[10px] w-full font-normal text-[16px] leading-[19px] text-[#a5a5a5] sm:w-[275px]">
                Read instantly on your device, Available in PDF format
              </p>
              {isReady ? null : (
                <p className="mt-[10px] font-bold text-[18px] leading-[22px] text-black">
                  {priceLabel}
                </p>
              )}
              {isReady ? (
                <Link
                  href={`/api/download?format=${format}`}
                  className="mt-[12px] inline-flex h-[60px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#296cf0] px-[16px] font-semibold text-[16px] text-white sm:w-auto"
                >
                  Download book 5mb
                  <DocumentDownloadIcon size={24} />
                </Link>
              ) : resolvedMode === "guest" ? (
                <Link
                  href={`/create-account?next=${encodeURIComponent(`/download?format=${format}`)}`}
                  className="mt-[12px] inline-flex h-[60px] w-full items-center justify-center gap-[8px] rounded-[8px] bg-[#296cf0] px-[16px] font-semibold text-[16px] text-white sm:w-[208px]"
                >
                  <UnlockIcon size={24} />
                  Create an account
                  <DocumentDownloadIcon size={24} />
                </Link>
              ) : null}
            </div>
          </div>
          {isReady ? null : (
            <div className="mt-8 w-full self-center sm:mt-[32px] sm:w-[564px]">
              <p className="font-medium text-[16px] leading-[19px] text-black">
                Select payment method
              </p>
              {error ? (
                <p className="mt-3 font-medium text-[14px] leading-[18px] text-[#b42318]">
                  {error}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-[31px] sm:grid-cols-2 sm:gap-[14px]">
                {methods.map((method) =>
                  resolvedMode === "pay" ? (
                    <button
                      key={method.label}
                      type="button"
                      disabled={pending}
                      onClick={() => pay(method.channel)}
                      className="flex h-[58px] cursor-pointer items-center gap-[10px] border border-solid border-[#e4e8eb] bg-white px-[16px] text-left font-medium text-[16px] text-[#14181b] disabled:cursor-wait"
                    >
                      <method.icon size={24} color="#296cf0" />
                      {method.label}
                    </button>
                  ) : (
                    <Link
                      key={method.label}
                      href={`/create-account?next=${encodeURIComponent(`/download?format=${format}`)}`}
                      className="flex h-[58px] items-center gap-[10px] border border-solid border-[#e4e8eb] bg-white px-[16px] font-medium text-[16px] text-[#14181b]"
                    >
                      <method.icon size={24} color="#296cf0" />
                      {method.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
