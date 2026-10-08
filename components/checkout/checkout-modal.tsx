"use client";

import Link from "next/link";
import { useState } from "react";
import { updateOrderQuantity } from "@/app/actions/orders";
import { AddIcon, CrossIcon, EditIcon, MinusIcon } from "@/components/icons";
import { BookCover } from "@/components/landing/book-cover";
import { CtaLink } from "@/components/landing/cta-button";
import { formatNgn } from "@/lib/money";
import type { CustomerOrder } from "@/lib/orders";

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-[16px]">
      <p className="font-normal text-[13px] leading-[16px] text-[#a5a5a5]">{label}</p>
      <p
        className={
          bold
            ? "text-right font-semibold text-[13px] leading-[16px] text-[#14181b]"
            : "max-w-[220px] text-right font-medium text-[13px] leading-[16px] text-[#14181b]"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function CheckoutModal({ order, coverUrl = null }: { order: CustomerOrder; coverUrl?: string | null }) {
  const [current, setCurrent] = useState(order);
  const [error, setError] = useState<string | null>(null);
  const quantity = current.quantity;
  const subtotal = current.unitPriceKobo * quantity;
  const delivery = current.kind === "hard_copy" ? current.deliveryFeeKobo : 0;

  async function changeQuantity(next: number) {
    const result = await updateOrderQuantity(current.id, next);
    if (result?.order) {
      setCurrent(result.order);
      setError(null);
      return;
    }
    setError(result?.error ?? "Quantity could not be updated.");
  }

  return (
    <div className="relative z-[2] w-full max-w-[480px] rounded-[16px] bg-white px-5 pt-5 pb-6 shadow-[0_8px_32px_rgba(20,24,27,0.08)] sm:px-[28px] sm:pt-[24px] sm:pb-[28px]">
      <div className="mb-[20px] flex items-center justify-between">
        <h1 className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
          Checkout
        </h1>
        <Link href="/home" aria-label="Close">
          <CrossIcon size={20} color="#14181b" />
        </Link>
      </div>

      <div className="rounded-[8px] bg-[#f8f8f8] px-[16px] py-[14px]">
        <div className="mb-[12px] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-[14px] leading-[17px] text-[#14181b]">
            Delivery detal
          </p>
          <Link
            href={`/place-order?format=${encodeURIComponent(current.productSlug || "hard-copy")}&edit=1&order=${current.id}`}
            className="inline-flex items-center gap-[4px] font-medium text-[13px] leading-[16px] text-[#296cf0]"
          >
            <EditIcon size={16} />
            Change delivery address
          </Link>
        </div>
        <div className="flex flex-col gap-[10px]">
          <SummaryRow label="State" value={current.state || "—"} />
          <SummaryRow label="City/Town" value={current.town || "—"} />
          <SummaryRow label="Phone number" value={current.phone || "—"} />
          <SummaryRow label="Nearest landmark" value={current.landmark || "—"} />
        </div>
      </div>

      <div className="mt-[16px] flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <div className="relative h-[48px] w-[36px] overflow-clip bg-[#021a28]">
            <BookCover src={coverUrl} width={36} height={48} className="absolute inset-0" />
          </div>
          <div>
            <p className="font-medium text-[14px] leading-[17px] text-[#14181b]">
              {current.productName}
            </p>
            <p className="font-semibold text-[13px] leading-[16px] text-[#14181b]">
              {formatNgn(current.unitPriceKobo)}
            </p>
          </div>
        </div>
        <div className="flex h-[32px] items-center gap-[12px] rounded-[20px] border border-solid border-[#e4e8eb] bg-white px-[10px]">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex size-[16px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#14181b]"
            onClick={() => changeQuantity(Math.max(1, quantity - 1))}
          >
            <MinusIcon size={14} />
          </button>
          <span className="min-w-[12px] text-center font-medium text-[14px] text-[#14181b]">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex size-[16px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#14181b]"
            onClick={() => changeQuantity(Math.min(99, quantity + 1))}
          >
            <AddIcon size={14} />
          </button>
        </div>
      </div>

      <div className="mt-[16px] rounded-[8px] bg-[#f8f8f8] px-[16px] py-[14px]">
        <p className="mb-[12px] font-medium text-[14px] leading-[17px] text-[#14181b]">
          Order summary
        </p>
        <div className="flex flex-col gap-[10px]">
          <SummaryRow label="No. of item" value={String(quantity)} bold />
          <SummaryRow label="Subtotal" value={formatNgn(subtotal)} />
          <SummaryRow label="Delivery fee" value={formatNgn(delivery)} />
          <SummaryRow label="Total amount" value={formatNgn(current.amountKobo)} />
        </div>
      </div>
      {error ? (
        <p className="mt-[12px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p>
      ) : null}

      <CtaLink href={`/payment?order=${current.id}`} className="mt-[20px] h-[52px] w-full">
        Checkout {formatNgn(current.amountKobo)}
      </CtaLink>
    </div>
  );
}
