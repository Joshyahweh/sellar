"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminRefresh, useAdminReviews } from "@/components/admin/admin-queries";
import { adminWrite, fieldClass, labelClass } from "@/components/admin/admin-write";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDay } from "@/lib/money";
import type { BookReview, ReviewStatus } from "@/lib/reviews";

type Draft = {
  id: string | null;
  authorName: string;
  rating: string;
  body: string;
};

const emptyDraft: Draft = { id: null, authorName: "", rating: "5", body: "" };

const statusLabel: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ReviewsManager({ reviews: initialReviews }: { reviews: BookReview[] }) {
  const reviewsQuery = useAdminReviews(initialReviews);
  const reviews = reviewsQuery.data;
  const refresh = useAdminRefresh("reviews");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const visibleReviews = reviews.filter((review) => statusFilter === "all" || review.status === statusFilter);

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

  const moderateMutation = useMutation({
    mutationFn: async (input: { id: string; status: "approved" | "rejected"; rejectionReason?: string }) => {
      await adminWrite(`/api/reviews/${input.id}`, "PATCH", {
        status: input.status,
        rejectionReason: input.rejectionReason ?? "",
      });
    },
    onSuccess: async () => {
      setMenuId(null);
      setRejectingId(null);
      setRejectReason("");
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The review could not be updated.");
    },
  });

  const pending = saveMutation.isPending || deleteMutation.isPending || moderateMutation.isPending;

  function remove(review: BookReview) {
    if (!review.id) return;
    if (!window.confirm(`Delete the review by ${review.authorName}?`)) return;
    setError("");
    deleteMutation.mutate(review);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Reviews</h1>
          <p className="mt-1 text-[14px] text-[#3d4650]">
            {visibleReviews.length} {visibleReviews.length === 1 ? "review matches" : "reviews match"} this filter.
          </p>
        </div>
        <Button type="button" onClick={() => { setError(""); setDraft(emptyDraft); }}>
          Add review
        </Button>
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value) => {
          if (value === "all" || value === "pending" || value === "approved" || value === "rejected") {
            setStatusFilter(value);
          }
        }}
      >
        <SelectTrigger className="h-10 w-[180px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
          <SelectValue>
            {(value) =>
              value === "pending" ? "Pending" : value === "approved" ? "Approved" : value === "rejected" ? "Rejected" : "All reviews"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reviews</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
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
              {["Date", "Author", "Status", "Rating", "Review", ""].map((column) => (
                <th key={column || "actions"} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleReviews.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#626262]" colSpan={6}>
                  {reviews.length === 0 ? "No reviews yet." : "No reviews with this status."}
                </td>
              </tr>
            ) : (
              visibleReviews.map((review) => (
                <tr key={review.id ?? review.authorName} className="border-b border-[#f2f3f8] last:border-0">
                  <td className="px-4 py-3 align-top">{formatDay(review.createdAt)}</td>
                  <td className="px-4 py-3 align-top">{review.authorName}</td>
                  <td className="px-4 py-3 align-top">
                    <p>{statusLabel[review.status]}</p>
                    {review.status === "rejected" && review.rejectionReason ? (
                      <p className="mt-1 max-w-[180px] text-[12px] text-[#626262]">{review.rejectionReason}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">{review.rating} / 5</td>
                  <td className="max-w-[360px] px-4 py-3 align-top">{review.body}</td>
                  <td className="px-4 py-3 text-right align-top">
                    {review.id ? (
                      <Popover
                        open={menuId === review.id}
                        onOpenChange={(open) => {
                          setMenuId(open ? review.id : null);
                          if (!open) setRejectingId(null);
                        }}
                      >
                        <PopoverTrigger
                          type="button"
                          className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-[#e4e8eb] bg-white px-3 text-[13px] font-medium text-[#14181b]"
                        >
                          Actions
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[220px] gap-1 p-1">
                          {rejectingId === review.id ? (
                            <div className="flex flex-col gap-2 p-2">
                              <input
                                className={fieldClass}
                                placeholder="Reason (optional)"
                                value={rejectReason}
                                maxLength={500}
                                onChange={(event) => setRejectReason(event.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setRejectingId(null)}>Cancel</Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={pending}
                                  onClick={() => moderateMutation.mutate({ id: review.id!, status: "rejected", rejectionReason: rejectReason })}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {review.status !== "approved" ? (
                                <button
                                  type="button"
                                  disabled={pending}
                                  className="flex h-9 w-full items-center rounded-md px-3 text-left text-[14px] hover:bg-[#f2f3f8] disabled:opacity-50"
                                  onClick={() => moderateMutation.mutate({ id: review.id!, status: "approved" })}
                                >
                                  Approve
                                </button>
                              ) : null}
                              {review.status !== "rejected" ? (
                                <button
                                  type="button"
                                  className="flex h-9 w-full items-center rounded-md px-3 text-left text-[14px] hover:bg-[#f2f3f8]"
                                  onClick={() => {
                                    setRejectingId(review.id);
                                    setRejectReason(review.rejectionReason ?? "");
                                  }}
                                >
                                  Reject
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="flex h-9 w-full items-center rounded-md px-3 text-left text-[14px] hover:bg-[#f2f3f8]"
                                onClick={() => {
                                  setMenuId(null);
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
                              </button>
                              <button
                                type="button"
                                className="flex h-9 w-full items-center rounded-md px-3 text-left text-[14px] text-[#ff0c6d] hover:bg-[#f2f3f8]"
                                onClick={() => {
                                  setMenuId(null);
                                  remove(review);
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    ) : null}
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
