"use client";

import Link from "next/link";
import { useState } from "react";
import { startPaystackCheckout, type PaystackChannel } from "@/app/actions/paystack";
import {
  BuildingIcon,
  CardIcon,
  CrossIcon,
  MobileIcon,
  ScanBarcodeIcon,
  TickCircleIcon,
} from "@/components/icons";
import { CtaButton, CtaLink } from "@/components/landing/cta-button";

const methods = [
  { channel: "card", icon: CardIcon, label: "Card" },
  { channel: "ussd", icon: MobileIcon, label: "USSD" },
  { channel: "bank_transfer", icon: BuildingIcon, label: "Bank transfer" },
  { channel: "qr", icon: ScanBarcodeIcon, label: "QR Coder" },
] as const satisfies ReadonlyArray<{
  channel: PaystackChannel;
  icon: typeof CardIcon;
  label: string;
}>;

export function PaymentMethodModal({
  orderId,
  notice,
}: {
  orderId?: string;
  notice?: string;
}) {
  const [error, setError] = useState<string | null>(notice ?? null);
  const [pending, setPending] = useState(false);

  async function pay(channel: PaystackChannel) {
    if (!orderId) {
      setError("Save a delivery address before paying.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await startPaystackCheckout(orderId, channel);
    if (result?.url) {
      window.location.assign(result.url);
      return;
    }
    setPending(false);
    setError(result?.error ?? "Paystack could not start this payment.");
  }

  return (
    <div className="relative z-[2] w-full max-w-[540px] rounded-[16px] bg-white px-5 pt-6 pb-6 shadow-[0_8px_32px_rgba(20,24,27,0.08)] sm:px-[32px] sm:pt-[28px] sm:pb-[28px]">
      <div className="mb-[20px] flex items-center justify-between">
        <h1 className="m-0 pr-3 font-normal text-[18px] leading-[120%] text-[#A5A5A5] sm:text-[20px] sm:leading-[100%]">
          How would you like to pay
        </h1>
        <Link href="/checkout" aria-label="Close">
          <CrossIcon size={20} color="#14181b" />
        </Link>
      </div>
      <p className="mb-[16px] font-medium text-[14px] leading-[17px] text-[#14181b]">
        Select payment method
      </p>
      {error ? (
        <p className="mb-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
        {methods.map((method) => (
          <button
            key={method.label}
            type="button"
            disabled={pending}
            onClick={() => pay(method.channel)}
            className="flex h-[52px] min-w-0 cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#f5f6f8] px-3 text-left font-medium text-[13px] text-[#14181b] disabled:cursor-wait sm:gap-[10px] sm:px-[16px] sm:text-[14px]"
          >
            <method.icon size={20} color="#296cf0" />
            {method.label}
          </button>
        ))}
      </div>
      <Link
        href="/checkout"
        className="mt-[24px] block text-center font-medium text-[14px] leading-[17px] text-[#296cf0]"
      >
        Cancel
      </Link>
    </div>
  );
}

export function CardPaymentModal({
  orderId,
  totalLabel = "NGN 3,500.00",
}: {
  orderId?: string;
  totalLabel?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function pay() {
    if (!orderId) {
      setError("Save a delivery address before paying.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await startPaystackCheckout(orderId, "card");
    if (result?.url) {
      window.location.assign(result.url);
      return;
    }
    setPending(false);
    setError(result?.error ?? "Paystack could not start this payment.");
  }

  return (
    <div className="relative z-[2] w-full max-w-[560px] rounded-[16px] bg-white px-5 pt-6 pb-6 shadow-[0_8px_32px_rgba(20,24,27,0.08)] sm:px-[32px] sm:pt-[28px] sm:pb-[32px]">
      <div className="mb-[16px] flex items-center justify-between">
        <h1 className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
          Card payment
        </h1>
        <Link href="/payment" aria-label="Close">
          <CrossIcon size={20} color="#14181b" />
        </Link>
      </div>
      <p className="mb-[20px] font-normal text-[13px] leading-[16px] text-[#14181b]">
        Card details are entered on Paystack. We never store your card number.
      </p>
      {error ? (
        <p className="mb-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p>
      ) : null}
      <CtaButton type="button" disabled={pending} onClick={pay} className="mt-[28px] h-[52px] w-full">
        Pay {totalLabel}
      </CtaButton>
    </div>
  );
}

export function PaymentSuccessModal() {
  return (
    <div className="relative z-[2] w-full max-w-[540px]">
      <PaymentMethodModal />
      <div className="absolute top-4 right-3 left-3 z-[3] rounded-[16px] bg-white px-5 pt-6 pb-6 shadow-[0_12px_40px_rgba(20,24,27,0.12)] sm:top-[20px] sm:right-[24px] sm:left-[24px] sm:px-[32px] sm:pt-[28px] sm:pb-[32px]">
        <div className="mb-[28px] flex items-center justify-between">
          <h1 className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
            Card payment
          </h1>
          <Link href="/home" aria-label="Close">
            <CrossIcon size={20} color="#14181b" />
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex size-[72px] items-center justify-center rounded-full bg-[#e8f8ee]">
            <TickCircleIcon size={40} color="#16a34a" />
          </div>
          <p className="mt-[16px] font-medium text-[16px] leading-[20px] text-[#14181b]">
            Order has been placed successfully
          </p>
        </div>
        <div className="mt-[28px] flex items-center justify-between gap-[16px]">
          <Link
            href="/home"
            className="flex h-[48px] flex-1 items-center justify-center font-medium text-[14px] text-[#296cf0]"
          >
            Got it
          </Link>
          <CtaLink href="/orders" className="h-[48px] flex-1">
            Track your order
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
