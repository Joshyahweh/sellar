"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminLegalPages, useAdminRefresh } from "@/components/admin/admin-queries";
import { adminWrite, fieldClass, labelClass } from "@/components/admin/admin-write";
import { Button } from "@/components/ui/button";
import { legalUpdatedLabel, type LegalPage } from "@/lib/legal";

type Draft = {
  slug: LegalPage["slug"];
  title: string;
  body: string;
};

export function LegalManager({ pages: initialPages }: { pages: LegalPage[] }) {
  const pagesQuery = useAdminLegalPages(initialPages);
  const pages = pagesQuery.data;
  const refresh = useAdminRefresh("legal-pages");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("Nothing to save.");
      await adminWrite(`/api/legal-pages/${draft.slug}`, "PATCH", {
        title: draft.title,
        body: draft.body,
      });
    },
    onSuccess: async () => {
      setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The page could not be saved.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Legal pages</h1>
        <p className="mt-1 text-[14px] text-[#626262]">
          Privacy policy, delivery and returns, and terms of use. These are the pages linked from the footer.
        </p>
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
          <label className={labelClass}>
            Title
            <input
              className={fieldClass}
              value={draft.title}
              required
              maxLength={120}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className={labelClass}>
            Page
            <textarea
              className={`${fieldClass} h-80 py-2 leading-[22px]`}
              value={draft.body}
              required
              maxLength={12000}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            />
          </label>
          <p className="text-[12px] text-[#626262]">Leave a blank line between paragraphs.</p>
          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
              {["Page", "Updated", ""].map((column) => (
                <th key={column || "actions"} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.slug} className="border-b border-[#f2f3f8] last:border-0">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-[#14181b]">{page.title}</p>
                  <p className="mt-1 text-[13px] text-[#626262]">/{page.slug}</p>
                </td>
                <td className="px-4 py-3 align-top text-[#626262]">{legalUpdatedLabel(page.updatedAt) || "Not saved yet"}</td>
                <td className="px-4 py-3 text-right align-top">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError("");
                      setDraft({ slug: page.slug, title: page.title, body: page.body });
                    }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
