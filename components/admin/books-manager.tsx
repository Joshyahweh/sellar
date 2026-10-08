"use client";

import { keepPreviousData, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAdminRefresh } from "@/components/admin/admin-queries";
import { adminUpload, adminWrite, fieldClass, labelClass } from "@/components/admin/admin-write";
import { InfiniteSentinel } from "@/components/admin/infinite-sentinel";
import { useDebounced } from "@/components/admin/use-debounced";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiJson } from "@/lib/api/browser";
import type { ListPage } from "@/lib/admin/pages";
import { formatNgn } from "@/lib/money";
import type { BookProduct } from "@/lib/products";

type Draft = {
  id: string | null;
  name: string;
  description: string;
  slug: string;
  kind: "hard_copy" | "e_copy";
  priceNaira: string;
  deliveryNaira: string;
  about: string;
};

type CoverFiles = {
  front: File | null;
  back: File | null;
  design: File | null;
};

const emptyFiles: CoverFiles = { front: null, back: null, design: null };

const emptyDraft: Draft = {
  id: null,
  name: "",
  description: "",
  slug: "",
  kind: "hard_copy",
  priceNaira: "",
  deliveryNaira: "",
  about: "",
};

function kindLabel(kind: string) {
  return kind === "e_copy" ? "E-copy" : "Hard copy";
}

function nairaInput(kobo: number) {
  return String(kobo / 100);
}

export function BooksManager({ firstPage }: { firstPage: ListPage<BookProduct> }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"" | "hard_copy" | "e_copy">("");
  const q = useDebounced(search);
  const isDefault = q === "" && kind === "";
  const booksQuery = useInfiniteQuery({
    queryKey: ["admin", "products", q, kind],
    queryFn: ({ pageParam }) => apiJson<ListPage<BookProduct>>(`/api/admin/books?${booksQueryString(pageParam, q, kind)}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialData: isDefault ? { pages: [firstPage], pageParams: [0] } : undefined,
    placeholderData: keepPreviousData,
  });
  const products = booksQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = booksQuery.data?.pages[0]?.total ?? 0;
  const refresh = useAdminRefresh("products");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [files, setFiles] = useState<CoverFiles>(emptyFiles);
  const [ebook, setEbook] = useState<File | null>(null);
  const [error, setError] = useState("");

  function edit(product: BookProduct) {
    setError("");
    setFiles(emptyFiles);
    setEbook(null);
    setDraft({
      id: product.id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      kind: product.kind,
      priceNaira: nairaInput(product.priceKobo),
      deliveryNaira: nairaInput(product.deliveryFeeKobo),
      about: product.about,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("Nothing to save.");
      const slug = draft.slug.trim() || draft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
      const body = {
        name: draft.name,
        description: draft.description,
        slug,
        kind: draft.kind === "e_copy" ? "e-book" : "hard-copy",
        priceNaira: draft.priceNaira,
        about: draft.about,
        ...(draft.kind === "hard_copy" ? { deliveryFeeNaira: draft.deliveryNaira } : {}),
      };
      const saved = (await adminWrite(
        draft.id ? `/api/products/${draft.id}` : "/api/products",
        draft.id ? "PATCH" : "POST",
        body,
      )) as { product?: { id?: string } };
      const id = draft.id ?? saved.product?.id ?? null;
      const chosen = [files.front, files.back, files.design].some(Boolean);
      if (id && chosen) {
        const form = new FormData();
        if (files.front) form.set("front", files.front);
        if (files.back) form.set("back", files.back);
        if (files.design) form.set("design", files.design);
        try {
          await adminUpload(`/api/products/${id}/covers`, form);
        } catch (caught) {
          setDraft({ ...draft, id });
          setFiles(emptyFiles);
          await refresh();
          throw caught instanceof Error ? caught : new Error("The cover images could not be uploaded.");
        }
      }
      if (id && draft.kind === "e_copy" && ebook) {
        const form = new FormData();
        form.set("file", ebook);
        try {
          await adminUpload(`/api/products/${id}/file`, form);
        } catch (caught) {
          setDraft({ ...draft, id });
          setEbook(null);
          await refresh();
          throw caught instanceof Error ? caught : new Error("The e-book file could not be uploaded.");
        }
      }
    },
    onSuccess: async () => {
      setDraft(null);
      setFiles(emptyFiles);
      setEbook(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The book could not be saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: BookProduct) => {
      if (!product.id) throw new Error("This book cannot be deleted.");
      await adminWrite(`/api/products/${product.id}`, "DELETE");
      return product.id;
    },
    onSuccess: async (id) => {
      if (draft?.id === id) setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The book could not be deleted.");
    },
  });

  const displayMutation = useMutation({
    mutationFn: async (product: BookProduct) => {
      if (!product.id) throw new Error("This book cannot be displayed.");
      await adminWrite(`/api/products/${product.id}`, "PATCH", { display: true });
    },
    onSuccess: async () => {
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The display book could not be updated.");
    },
  });

  const pending = saveMutation.isPending || deleteMutation.isPending || displayMutation.isPending;

  function remove(product: BookProduct) {
    if (!product.id) return;
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setError("");
    deleteMutation.mutate(product);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Books</h1>
          <p className="mt-1 text-[14px] text-[#3d4650]">{total} {total === 1 ? "book matches" : "books match"} these filters.</p>
        </div>
        <Button type="button" onClick={() => { setError(""); setFiles(emptyFiles); setEbook(null); setDraft(emptyDraft); }}>
          Add book
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#e4e8eb] bg-white px-3 text-[14px]"
          value={search}
          placeholder="Search name or slug"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={kind || "all"} onValueChange={(value) => setKind(value === "hard_copy" || value === "e_copy" ? value : "")}>
          <SelectTrigger className="h-10 w-[160px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
            <SelectValue>{(value) => (value === "e_copy" ? "E-copy" : value === "hard_copy" ? "Hard copy" : "All formats")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            <SelectItem value="hard_copy">Hard copy</SelectItem>
            <SelectItem value="e_copy">E-copy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error ? <p className="text-[14px] text-[#ff0c6d]">{error}</p> : null}
      {draft ? (
        <form
          className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-[#14181b]/10 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <label className={labelClass}>
            Name
            <input className={fieldClass} value={draft.name} required onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className={labelClass}>
            Slug
            <input className={fieldClass} value={draft.slug} placeholder="Generated from the name if empty" onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Description
            <textarea className={`${fieldClass} h-24 py-2`} maxLength={500} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            About this book
            <span className="font-normal text-[#626262]">Shown in About this book when this book is on display. Separate paragraphs with a blank line.</span>
            <textarea className={`${fieldClass} h-32 py-2`} maxLength={4000} value={draft.about} onChange={(event) => setDraft({ ...draft, about: event.target.value })} />
          </label>
          <label className={labelClass}>
            Format
            <Select
              value={draft.kind}
              onValueChange={(value) => {
                if (value === "hard_copy" || value === "e_copy") {
                  setDraft({ ...draft, kind: value, deliveryNaira: value === "e_copy" ? "" : draft.deliveryNaira });
                }
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
                <SelectValue>
                  {(value) => (value === "e_copy" ? "E-copy" : value === "hard_copy" ? "Hard copy" : "Format")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hard_copy">Hard copy</SelectItem>
                <SelectItem value="e_copy">E-copy</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className={labelClass}>
            Price (NGN)
            <input className={fieldClass} inputMode="decimal" value={draft.priceNaira} required onChange={(event) => setDraft({ ...draft, priceNaira: event.target.value })} />
          </label>
          {draft.kind === "hard_copy" ? (
            <label className={labelClass}>
              Delivery fee (NGN)
              <input className={fieldClass} inputMode="decimal" value={draft.deliveryNaira} required onChange={(event) => setDraft({ ...draft, deliveryNaira: event.target.value })} />
            </label>
          ) : null}
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
            <CoverField
              label="Front cover"
              file={files.front}
              current={products.find((product) => product.id === draft.id)?.frontCoverUrl}
              onChange={(file) => setFiles({ ...files, front: file })}
            />
            <CoverField
              label="Back cover"
              file={files.back}
              current={products.find((product) => product.id === draft.id)?.backCoverUrl}
              onChange={(file) => setFiles({ ...files, back: file })}
            />
            <CoverField
              label="Design cover"
              file={files.design}
              current={products.find((product) => product.id === draft.id)?.designCoverUrl}
              onChange={(file) => setFiles({ ...files, design: file })}
            />
          </div>
          {draft.kind === "e_copy" ? (
            <label className={`${labelClass} sm:col-span-2`}>
              E-book PDF
              <span className="font-normal text-[#626262]">
                {products.find((product) => product.id === draft.id)?.hasEbook
                  ? "A PDF is already stored in the ebooks bucket. Choose a file to replace it."
                  : "Upload the PDF that buyers download after payment."}
              </span>
              <input
                className="text-[13px] file:mr-2 file:rounded-md file:border-0 file:bg-[#eef6fb] file:px-2 file:py-1 file:text-[13px] file:font-medium file:text-[#296cf0]"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setEbook(event.target.files?.[0] ?? null)}
              />
            </label>
          ) : null}
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={pending}>{draft.id ? "Save changes" : "Create book"}</Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
              {["Name", "Format", "Display", "Covers", "File", "Slug", "Price", "Delivery", ""].map((column) => (
                <th key={column || "actions"} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#626262]" colSpan={9}>No books match these filters.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id ?? product.slug} className="border-b border-[#f2f3f8] last:border-0">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{kindLabel(product.kind)}</td>
                  <td className="px-4 py-3">
                    {product.isDisplay ? (
                      <span className="font-semibold text-[#296cf0]">On display</span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending || !product.id}
                        onClick={() => displayMutation.mutate(product)}
                      >
                        Set as display
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <CoverThumb url={product.frontCoverUrl} label="Front cover" />
                      <CoverThumb url={product.backCoverUrl} label="Back cover" />
                      <CoverThumb url={product.designCoverUrl} label="Design cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.kind === "e_copy" ? (product.hasEbook ? "Stored" : "—") : "—"}</td>
                  <td className="px-4 py-3">{product.slug}</td>
                  <td className="px-4 py-3">{formatNgn(product.priceKobo)}</td>
                  <td className="px-4 py-3">{product.kind === "e_copy" ? "—" : formatNgn(product.deliveryFeeKobo)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => edit(product)}>Edit</Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => void remove(product)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <InfiniteSentinel enabled={Boolean(booksQuery.hasNextPage) && !booksQuery.isFetchingNextPage} onVisible={() => void booksQuery.fetchNextPage()} />
      {booksQuery.isFetchingNextPage ? <p className="text-center text-[13px] text-[#3d4650]">Loading more books…</p> : null}
    </div>
  );
}

function booksQueryString(page: number, q: string, kind: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (kind) params.set("kind", kind);
  return params.toString();
}

function CoverField({
  label,
  file,
  current,
  onChange,
}: {
  label: string;
  file: File | null;
  current?: string | null;
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || current;

  return (
    <label className={labelClass}>
      {label}
      {shown ? (
        <img src={shown} alt="" className="h-24 w-full rounded-lg bg-[#f6f7fb] object-contain" />
      ) : null}
      <input
        className="text-[13px] file:mr-2 file:rounded-md file:border-0 file:bg-[#eef6fb] file:px-2 file:py-1 file:text-[13px] file:font-medium file:text-[#296cf0]"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function CoverThumb({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="inline-block size-10 rounded bg-[#f2f3f8]" title={`${label} missing`} />;
  return <img src={url} alt={label} title={label} className="size-10 rounded bg-[#f6f7fb] object-contain" />;
}
