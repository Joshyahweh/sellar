export type ReviewStatus = "pending" | "approved" | "rejected";

export type BookReview = {
  id: string | null;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  status: ReviewStatus;
  rejectionReason: string | null;
};

export const reviewSelect = "id, author_name, rating, body, created_at, status, rejection_reason";

const defaultBody = [
  "I actually liked reading this book. I thought it was really nice.",
  "I liked that the two main characters were clear with each other when they decided to be clear, and I liked how their relationship unfolded. It was slow, gentle, thoughtful a",
].join("\n\n");

export const defaultReviews: BookReview[] = ["#6155f5", "#cb30e0", "#0088ff"].map(() => ({
  id: null,
  authorName: "Haddy Alex",
  rating: 5,
  body: defaultBody,
  createdAt: "2026-10-02T12:00:00.000Z",
  status: "approved",
  rejectionReason: null,
}));

export function reviewInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function averageRating(reviews: BookReview[]) {
  if (reviews.length === 0) return 4.8;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function reviewFromInput(input: {
  authorName?: unknown;
  rating?: unknown;
  body?: unknown;
}) {
  const authorName = String(input.authorName ?? "").trim();
  const body = String(input.body ?? "").trim();
  const rating =
    input.rating === undefined || input.rating === null || input.rating === ""
      ? 5
      : Number(input.rating);

  if (authorName.length < 2 || authorName.length > 80) {
    return { error: "Author name must be between 2 and 80 characters." };
  }
  if (body.length < 8 || body.length > 2000) {
    return { error: "Review must be between 8 and 2000 characters." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be a whole number from 1 to 5." };
  }

  return { review: { author_name: authorName, rating, body } };
}

export function mapReview(row: {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
  status?: string | null;
  rejection_reason?: string | null;
}): BookReview {
  const status: ReviewStatus =
    row.status === "pending" || row.status === "rejected" ? row.status : "approved";
  const rejectionReason = row.rejection_reason ? String(row.rejection_reason) : null;
  return {
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    status,
    rejectionReason,
  };
}
