"use client";

import { CrossIcon, TickCircleIcon } from "@/components/icons";
import { CtaButton, CtaLink } from "@/components/landing/cta-button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function SuccessDialog({
  open,
  title,
  message,
  onClose,
  action,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  action?: { href: string; label: string };
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[80] bg-[#e4e7f5]/55 supports-backdrop-filter:backdrop-blur-md!"
        className="z-[80] gap-0 rounded-[16px] bg-white p-0 text-[#14181b] shadow-[0_8px_32px_rgba(20,24,27,0.08)] ring-0 sm:max-w-[480px]"
      >
        <div className="px-5 pt-6 pb-6 sm:px-8 sm:pt-7 sm:pb-8">
          <div className="mb-7 flex items-center justify-between">
            <DialogTitle className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
              {title}
            </DialogTitle>
            <DialogClose
              aria-label="Close"
              className="flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            >
              <CrossIcon size={20} color="#14181b" />
            </DialogClose>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex size-[72px] items-center justify-center rounded-full bg-[#e8f8ee]">
              <TickCircleIcon size={40} color="#16a34a" />
            </div>
            <p className="mt-4 text-center font-medium text-[16px] leading-[24px] text-[#14181b]">
              {message}
            </p>
          </div>
          <div className="mt-7">
            {action ? (
              <CtaLink href={action.href} className="h-[52px] w-full">
                {action.label}
              </CtaLink>
            ) : (
              <CtaButton type="button" onClick={onClose} className="h-[52px] w-full">
                Got it
              </CtaButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
