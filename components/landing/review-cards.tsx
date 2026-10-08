"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { submitReview } from "@/app/actions/reviews";
import { CrossIcon } from "@/components/icons";
import { CtaButton, CtaLink } from "@/components/landing/cta-button";
import { StarRating } from "@/components/landing/star-rating";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

const ratingLabels = ["1. Poor", "2. Fair", "3. Good", "4. Very Good", "5. Excellent"];

function RateStar({ selected }: { selected: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M17.7363 6.89648L12.7773 6.17578L10.5605 1.68164C10.5 1.55859 10.4004 1.45898 10.2773 1.39844C9.96875 1.24609 9.59375 1.37305 9.43945 1.68164L7.22266 6.17578L2.26367 6.89648C2.12695 6.91602 2.00195 6.98047 1.90625 7.07812C1.79055 7.19704 1.72679 7.35703 1.72899 7.52293C1.73119 7.68884 1.79916 7.84708 1.91797 7.96289L5.50586 11.4609L4.6582 16.4004C4.63833 16.5153 4.65104 16.6335 4.69491 16.7415C4.73877 16.8496 4.81203 16.9431 4.90638 17.0117C5.00073 17.0802 5.1124 17.1209 5.22871 17.1292C5.34502 17.1375 5.46133 17.113 5.56445 17.0586L10 14.7266L14.4355 17.0586C14.5566 17.123 14.6973 17.1445 14.832 17.1211C15.1719 17.0625 15.4004 16.7402 15.3418 16.4004L14.4941 11.4609L18.082 7.96289C18.1797 7.86719 18.2441 7.74219 18.2637 7.60547C18.3164 7.26367 18.0781 6.94727 17.7363 6.89648Z"
        fill={selected ? "#FF0C6D" : "none"}
        stroke={selected ? "#FF0C6D" : "#B7C3CC"}
        strokeWidth={selected ? 0 : 1.2}
      />
    </svg>
  );
}

function WriteReviewDialog({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const sent = Boolean(notice);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[80] bg-[#e4e7f5]/50 supports-backdrop-filter:backdrop-blur-md!"
        className="z-[80] gap-0 rounded-[16px] bg-white p-0 text-[#14181b] shadow-[0_8px_32px_rgba(20,24,27,0.08)] ring-0 sm:max-w-[686px]"
      >
        <form
          className="px-5 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8"
          onSubmit={async (event) => {
            event.preventDefault();
            if (rating < 1) {
              setError("Tap a star to rate this book.");
              return;
            }
            setPending(true);
            setError(null);
            const result = await submitReview({ rating, body });
            setPending(false);
            if (result.error) {
              setError(result.error);
              return;
            }
            setNotice(result.message ?? "Your review was sent. It will appear after it is approved.");
          }}
        >
          <div className="flex items-center justify-between border-b border-[#eef1f4] pb-4">
            <DialogTitle className="m-0 font-normal text-[20px] leading-[100%] text-[#A5A5A5]">
              Leave a review
            </DialogTitle>
            <DialogClose aria-label="Close" className="flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent p-0">
              <CrossIcon size={20} color="#14181b" />
            </DialogClose>
          </div>

          <p className="mt-5 mb-3 font-semibold text-[16px] leading-[20px] tracking-[0.01em] text-[#14181b]">
            How would you rate this book ?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {ratingLabels.map((label) => (
              <p key={label} className="m-0 font-normal text-[12px] leading-[100%] text-[#A5A5A5] sm:text-[14px]">
                {label}
              </p>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-[6px]">
            {ratingLabels.map((label, index) => {
              const value = index + 1;
              const selected = value <= rating;
              return (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled={sent}
                  className="border-0 bg-transparent p-0"
                  onClick={() => setRating(value)}
                >
                  <RateStar selected={selected} />
                </button>
              );
            })}
          </div>
          <p className="mt-1 mb-5 font-normal text-[16px] leading-[100%] text-[#A5A5A5]">Tap to star rate</p>

          <label className="font-semibold text-[16px] leading-[20px] tracking-[0.01em] text-[#14181b]">
            What do you think about this book ?
            <span className="relative mt-2 block">
              <textarea
                required
                minLength={8}
                maxLength={500}
                value={body}
                disabled={sent}
                onChange={(event) => setBody(event.target.value.slice(0, 500))}
                placeholder="Tell us what you think"
                className="h-[140px] w-full resize-none rounded-[8px] border border-[#d7e0e6] bg-white px-3 pt-3 pb-8 font-medium text-[16px] leading-[20px] text-[#14181b] outline-none placeholder:font-medium placeholder:text-[#B1BEC6]"
              />
              <span className="pointer-events-none absolute right-3 bottom-2 font-medium text-[12px] leading-[20px] text-[#A5A5A5]">
                {body.length}/500
              </span>
            </span>
          </label>

          {error ? <p className="mt-3 mb-0 text-[14px] text-[#b42318]">{error}</p> : null}
          {notice ? <p className="mt-3 mb-0 text-[14px] leading-[20px] text-[#296cf0]">{notice}</p> : null}

          <CtaButton type="submit" disabled={pending || sent} className="mt-4 h-[52px] w-full text-[16px]">
            Publish review
          </CtaButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewsSection({ reviews, signedIn = false }: { reviews: BookReview[]; signedIn?: boolean }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
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
          {signedIn ? (
            <CtaButton variant="outline" className="w-full sm:w-auto" onClick={() => setWriting(true)}>
              Write a review
            </CtaButton>
          ) : (
            <CtaLink href={`/sign-in?next=${encodeURIComponent(`${pathname}#reviews`)}`} variant="outline" className="w-full sm:w-auto">
              Write a review
            </CtaLink>
          )}
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
      {writing ? <WriteReviewDialog onClose={() => setWriting(false)} /> : null}
    </section>
  );
}
