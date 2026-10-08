"use client";

import { useState } from "react";
import { CtaButton } from "@/components/landing/cta-button";
import { StarRating } from "@/components/landing/star-rating";
import { averageRating, reviewInitials, type BookReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const avatarColors = ["bg-[#6155f5]", "bg-[#cb30e0]", "bg-[#0088ff]"];

function reviewDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = date.toLocaleString("en-GB", { month: "short" }).toLowerCase();
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

function ReviewCard({
  review,
  color,
  open,
  onToggle,
}: {
  review: BookReview;
  color: string;
  open: boolean;
  onToggle: () => void;
}) {
  const paragraphs = review.body.split(/\n+/).filter(Boolean);
  const canExpand = paragraphs.length > 1;
  const visible = open || !canExpand ? paragraphs : paragraphs.slice(0, 1);

  return (
    <article className="flex w-full shrink-0 flex-col items-start overflow-clip rounded-[12px] bg-[#eff2f4] px-5 py-4 sm:px-[36px] sm:py-[20px]">
      <div className="flex w-full flex-col items-start gap-[6px]">
        <div className="flex w-full flex-col items-start gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className={`relative size-[40px] shrink-0 overflow-clip rounded-[30px] ${color}`}>
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-[14px] leading-[normal] whitespace-nowrap text-white">
                {reviewInitials(review.authorName)}
              </p>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-[4px] desk:w-[165px]">
              <p className="w-full font-bold text-[16px] leading-[1.22] text-[#242428]">
                {review.authorName}
              </p>
              <div className="flex w-full items-center gap-[4px]">
                <div className="flex w-[86px] flex-col items-start">
                  <StarRating size={16} value={review.rating} />
                </div>
                <p className="font-normal text-[16px] leading-[1.22] whitespace-nowrap text-[#a5a5a5]">
                  {reviewDate(review.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full font-semibold text-[16px] text-[#637a87]">
            {visible.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mb-0 leading-[1.26]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {canExpand ? (
          <button
            type="button"
            className="w-full cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-[16px] leading-[normal] text-[#296cf0]"
            aria-expanded={open}
            onClick={onToggle}
          >
            {open ? "Read less" : "Read more..."}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function ReviewsSection({ reviews }: { reviews: BookReview[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const fitsDesktopFrame = reviews.length <= 3 && openIndex === null;
  const score = averageRating(reviews);

  return (
    <section
      id="reviews"
      className={cn(
        "relative w-full shrink-0 overflow-hidden bg-white px-5 py-10",
        fitsDesktopFrame ? "desk:h-[768px] desk:overflow-clip desk:px-0 desk:py-0" : "desk:px-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[868px] flex-col items-start gap-4",
          fitsDesktopFrame
            ? "desk:absolute desk:top-1/2 desk:left-[286px] desk:w-[868px] desk:-translate-y-1/2 desk:gap-[12px]"
            : "desk:relative desk:w-[868px] desk:gap-[12px] desk:py-10",
        )}
      >
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between desk:gap-[12px]">
          <div className="flex min-w-px flex-1 items-end">
            <div className="flex w-full flex-col items-start gap-3 desk:w-[470px] desk:shrink-0 desk:gap-[12px]">
              <h2 className="m-0 font-normal text-[24px] leading-[1.22] text-[#242428] desk:text-[32px] desk:whitespace-nowrap">
                What readers say about this book
              </h2>
              <div className="flex w-full flex-wrap items-center gap-2 desk:items-start desk:gap-[6px]">
                <p className="font-normal text-[16px] leading-[1.22] whitespace-nowrap text-[#a5a5a5] desk:text-[18px]">
                  Rating and Reviews
                </p>
                <div className="flex items-center gap-[9px]">
                  <p className="font-medium text-[21px] leading-[1.22] whitespace-nowrap text-[#242428]">
                    {score.toFixed(1)}{" "}
                  </p>
                  <div className="flex w-[100px] flex-col items-start">
                    <StarRating size={20} value={score} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CtaButton variant="outline" className="w-full sm:w-auto">
            Write a review
          </CtaButton>
        </div>
        <div className="flex w-full items-start desk:w-[868px]">
          <div className="flex min-w-px flex-1 flex-col items-start gap-4 desk:gap-[19px]">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.id ?? `${review.authorName}-${index}`}
                review={review}
                color={avatarColors[index % avatarColors.length]}
                open={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
