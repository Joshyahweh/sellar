"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/app/actions/orders";
import { ArrowLeftIcon, CrossIcon, EditIcon } from "@/components/icons";
import { CtaButton } from "@/components/landing/cta-button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IconInputField } from "@/components/ui/input-field";
import type { DeliveryAddress } from "@/lib/orders";
import { cn } from "@/lib/utils";

export function PlaceOrderModal({
  format = "hard-copy",
  previous = null,
  startEditing = false,
  orderId = null,
  stayOnPage = false,
  onDismiss,
}: {
  format?: string;
  previous?: DeliveryAddress | null;
  startEditing?: boolean;
  orderId?: string | null;
  stayOnPage?: boolean;
  onDismiss?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(startEditing || !previous);
  const saved = previous && !useNewAddress ? previous : null;
  const closeHref = orderId ? `/checkout?order=${orderId}` : "/home";

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createOrder(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (stayOnPage) {
      setOpen(false);
      onDismiss?.();
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) {
          if (onDismiss) onDismiss();
          else router.push(closeHref);
        }
      }}
    >
    <DialogContent
      showCloseButton={false}
      overlayClassName="z-[80] bg-[#e4e7f5]/50 supports-backdrop-filter:backdrop-blur-md!"
      className={cn(
        "z-[80] max-h-[min(760px,calc(100dvh-2rem))] gap-0 overflow-y-auto rounded-[16px] bg-white p-0 text-[#14181b] shadow-[0_8px_32px_rgba(20,24,27,0.08)] ring-0",
        saved ? "sm:max-w-[480px]" : "sm:max-w-[560px]",
      )}
    >
    <form
      className={saved ? "px-5 pt-5 pb-6 sm:px-[28px] sm:pt-[24px] sm:pb-[28px]" : "px-5 pt-6 pb-6 sm:px-[32px] sm:pt-[28px] sm:pb-[32px]"}
      onSubmit={async (event) => {
        event.preventDefault();
        await submit(new FormData(event.currentTarget));
      }}
    >
      <input type="hidden" name="format" value={format} />
      {stayOnPage ? <input type="hidden" name="stay" value="profile" /> : null}
      {orderId ? <input type="hidden" name="order" value={orderId} /> : null}
      {saved ? (
        <>
          <input type="hidden" name="country" value={saved.country} />
          <input type="hidden" name="state" value={saved.state} />
          <input type="hidden" name="town" value={saved.town} />
          <input type="hidden" name="landmark" value={saved.landmark} />
          <input type="hidden" name="phone" value={saved.phone} />
        </>
      ) : null}
      {previous && !saved ? (
        <button
          type="button"
          className="mb-[16px] inline-flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 font-medium text-[13px] leading-[16px] text-[#296cf0]"
          onClick={() => {
            setError(null);
            setUseNewAddress(false);
          }}
        >
          <ArrowLeftIcon size={16} color="#296cf0" />
          Back to my address
        </button>
      ) : null}
      <div className={`flex items-center justify-between ${saved ? "mb-[20px]" : "mb-[24px]"}`}>
        <DialogTitle className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
          Delivery address
        </DialogTitle>
        <DialogClose aria-label="Close" className="flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent p-0">
          <CrossIcon size={20} color="#14181b" />
        </DialogClose>
      </div>
      {saved ? (
        <div className="rounded-[8px] bg-[#f8f8f8] px-[16px] py-[14px]">
          <div className="mb-[12px] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-[14px] leading-[17px] text-[#14181b]">Previous address</p>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 font-medium text-[13px] leading-[16px] text-[#296cf0]"
              onClick={() => {
                setError(null);
                setUseNewAddress(true);
              }}
            >
              <EditIcon size={16} color="#296cf0" />
              Use new address
            </button>
          </div>
          <div className="flex flex-col gap-[10px]">
            <AddressRow label="State" value={saved.state} />
            <AddressRow label="City/Town" value={saved.town} />
            <AddressRow label="Phone number" value={saved.phone} />
            <AddressRow label="Nearest landmark" value={saved.landmark} />
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-x-[16px] gap-y-5 sm:grid-cols-2 sm:gap-y-[20px]">
        <IconInputField label="Country" name="country" placeholder="Select" defaultValue={previous?.country ?? ""} />
        <IconInputField label="State" name="state" placeholder="Select" defaultValue={previous?.state ?? ""} />
        <IconInputField label="Town" name="town" placeholder="Select" defaultValue={previous?.town ?? ""} />
        <IconInputField
          label="Nearest landmark"
          name="landmark"
          placeholder="Enter house address"
          defaultValue={previous?.landmark ?? ""}
        />
        <div className="col-span-1 sm:col-span-2">
          <IconInputField
            label="Phone number"
            name="phone"
            placeholder="Select"
            defaultValue={previous?.phone ?? ""}
          />
        </div>
      </div>
      )}
      {error ? (
        <p className="mt-[16px] font-medium text-[13px] leading-[16px] text-[#b42318]">{error}</p>
      ) : null}
      <CtaButton type="submit" disabled={pending} className={saved ? "mt-[20px] h-[52px] w-full" : "mt-[28px] h-[52px] w-full"}>
        {saved ? "Proceed" : "Save"}
      </CtaButton>
    </form>
    </DialogContent>
    </Dialog>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[16px]">
      <p className="font-normal text-[13px] leading-[16px] text-[#a5a5a5]">{label}</p>
      <p className="max-w-[220px] text-right font-medium text-[13px] leading-[16px] text-[#14181b]">{value}</p>
    </div>
  );
}
