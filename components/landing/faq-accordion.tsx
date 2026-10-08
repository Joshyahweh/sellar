"use client";

import { useState } from "react";
import { CrossIcon, PlusIcon } from "@/components/icons";
import type { BookFaq } from "@/lib/faqs";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs }: { faqs: BookFaq[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const fitsDesktopFrame = faqs.length <= 4;

  return (
    <section
      id="faqs"
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-[#f8f8f8] px-5 py-10",
        fitsDesktopFrame ? "desk:h-[650px] desk:overflow-clip desk:px-0 desk:py-0" : "desk:px-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1268px] flex-col items-start gap-8",
          fitsDesktopFrame
            ? "desk:absolute desk:top-1/2 desk:left-[90px] desk:max-w-none desk:-translate-y-1/2 desk:flex-row desk:items-start desk:gap-[37px]"
            : "desk:relative desk:flex-row desk:items-start desk:gap-[37px] desk:py-10",
        )}
      >
        <div className="flex w-full flex-col items-center gap-4 text-center font-normal desk:w-auto desk:gap-[20px]">
          <h2 className="m-0 w-full max-w-[423px] text-[24px] text-[#242428] desk:w-[423px] desk:text-[32px]">
            <span className="mb-0 block leading-[1.22]">Have a question?</span>
            <span className="block leading-[1.22]">We’ve got you covered</span>
          </h2>
          <p className="w-full max-w-[423px] text-[16px] leading-[20px] text-[#626262] desk:w-[423px]">
            A deeply personal journey of faith, identity and personal
            discovering what it means to be fully known by God
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 desk:w-[808px] desk:shrink-0 desk:gap-[16px]">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            const key = item.id ?? item.question;

            if (isOpen) {
              return (
                <div
                  key={key}
                  className="flex w-full shrink-0 flex-col items-start rounded-[8px] bg-[#eef6fb] px-4 pt-4 pb-5 sm:px-[24px] sm:pt-[16px] sm:pb-[20px]"
                >
                  <div className="flex w-full items-start justify-between gap-3 sm:items-center">
                    <p className="min-w-0 font-semibold text-[16px] leading-[1.3] text-[#14181b] sm:text-[18px] sm:leading-[1.12]">
                      {item.question}
                    </p>
                    <button
                      type="button"
                      aria-expanded="true"
                      aria-label="Collapse answer"
                      onClick={() => setOpenIndex(-1)}
                      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[72px] border-0 bg-[#048bdc] p-0 desk:size-[62px] desk:p-[24px]"
                    >
                      <CrossIcon size={14} color="#FBFCFC" />
                    </button>
                  </div>
                  <p className="mt-3 w-full font-normal text-[15px] leading-[1.72] text-[#14181b] sm:text-[16px] desk:mt-0 desk:w-[648px]">
                    {item.answer}
                  </p>
                </div>
              );
            }

            return (
              <button
                key={key}
                type="button"
                aria-expanded="false"
                onClick={() => setOpenIndex(index)}
                className="flex w-full shrink-0 cursor-pointer items-start justify-between gap-3 rounded-[8px] border border-solid border-[#e4e8eb] bg-transparent px-4 py-4 text-left sm:items-center sm:px-[24px] sm:py-[16px]"
              >
                <p className="min-w-0 text-left font-normal text-[16px] leading-[1.3] text-[#14181b] sm:text-[18px] sm:leading-[1.12]">
                  {item.question}
                </p>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[72px] bg-[#eff2f4] desk:size-[62px] desk:p-[24px]">
                  <PlusIcon size={14} color="#283136" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
