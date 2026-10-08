"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/browser";
import type { BookFaq } from "@/lib/faqs";
import type { LegalPage } from "@/lib/legal";
import type { BookProduct } from "@/lib/products";
import type { BookReview } from "@/lib/reviews";

export function useAdminRefresh(key: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["admin", key] });
}

export function useAdminProducts(initialData: BookProduct[]) {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => (await apiJson<{ products: BookProduct[] }>("/api/products")).products,
    initialData,
  });
}

export function useAdminReviews(initialData: BookReview[]) {
  return useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => (await apiJson<{ reviews: BookReview[] }>("/api/reviews")).reviews,
    initialData,
  });
}

export function useAdminLegalPages(initialData: LegalPage[]) {
  return useQuery({
    queryKey: ["admin", "legal-pages"],
    queryFn: async () => (await apiJson<{ pages: LegalPage[] }>("/api/legal-pages")).pages,
    initialData,
  });
}

export function useAdminFaqs(initialData: BookFaq[]) {
  return useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => (await apiJson<{ faqs: BookFaq[] }>("/api/faqs")).faqs,
    initialData,
  });
}
