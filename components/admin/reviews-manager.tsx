"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminRefresh, useAdminReviews } from "@/components/admin/admin-queries";
import { adminWrite, fieldClass, labelClass } from "@/components/admin/admin-write";
import { Button } from "@/components/ui/button";
import { formatDay } from "@/lib/money";
import type { BookReview } from "@/lib/reviews";

type Draft = {
  id: string | null;
  authorName: string;
  rating: string;
  body: string;
};

const emptyDraft: Draft = { id: null, authorName: "", rating: "5", body: "" };

export function ReviewsManager({ reviews: initialReviews }: { reviews: BookReview[] }) {
  const reviewsQuery = useAdminReviews(initialReviews);
  const reviews = reviewsQuery.data;
  const refresh = useAdminRefresh("reviews");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("Nothing to save.");
      const body = { authorName: draft.authorName, rating: Number(draft.rating), body: draft.body };
      await adminWrite(draft.id ? `/api/reviews/${draft.id}` : "/api/reviews", draft.id ? "PATCH" : "POST", body);
    },
    onSuccess: async () => {
      setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The review could not be saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (review: BookReview) => {
      if (!review.id) throw new Error("This review cannot be deleted.");
      await adminWrite(`/api/reviews/${review.id}`, "DELETE");
      return review.id;
    },
    onSuccess: async (id) => {
      if (draft?.id === id) setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The review could not be deleted.");
    },
  });

  const pending = saveMutation.isPending || deleteMutation.isPending;

  function remove(review: BookReview) {
    if (!review.id) return;
    if (!window.confirm(`Delete the review by ${review.authorName}?`)) return;
    setError("");
    deleteMutation.mutate(review);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Reviews</h1>
        <Button type="button" onClick={() => { setError(""); setDraft(emptyDraft); }}>
          Add review
        </Button>
      </div>
      {error ? <p className="text-[14px] text-[#ff0c6d]">{error}</p> : null}
      {draft ? (
        <form
          className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-[#14181b]/10"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <label className={labelClass}>
              Author
              <input className={fieldClass} value={draft.authorName} required onChange={(event) => setDraft({ ...draft, authorName: event.target.value })} />
            </label>
            <label className={labelClass}>
              Rating
              <input className={fieldClass} inputMode="numeric" min={1} max={5} value={draft.rating} required onChange={(event) => setDraft({ ...draft, rating: event.target.value })} />
            </label>
          </div>
          <label className={labelClass}>
            Review
            <textarea className={`${fieldClass} h-28 py-2`} value={draft.body} required onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{draft.id ? "Save changes" : "Create review"}</Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
              {["Date", "Author", "Rating", "Review", ""].map((column) => (
                <th key={column || "actions"} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#626262]" colSpan={5}>No reviews yet.</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id ?? review.authorName} className="border-b border-[#f2f3f8] last:border-0">
                  <td className="px-4 py-3 align-top">{formatDay(review.createdAt)}</td>
                  <td className="px-4 py-3 align-top">{review.authorName}</td>
                  <td className="px-4 py-3 align-top">{review.rating} / 5</td>
                  <td className="max-w-[360px] px-4 py-3 align-top">{review.body}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError("");
                          setDraft({
                            id: review.id,
                            authorName: review.authorName,
                            rating: String(review.rating),
                            body: review.body,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => void remove(review)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
