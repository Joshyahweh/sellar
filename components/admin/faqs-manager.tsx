"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminFaqs, useAdminRefresh } from "@/components/admin/admin-queries";
import { adminWrite, fieldClass, labelClass } from "@/components/admin/admin-write";
import { Button } from "@/components/ui/button";
import type { BookFaq } from "@/lib/faqs";

type Draft = {
  id: string | null;
  question: string;
  answer: string;
  position: string;
};

const emptyDraft: Draft = { id: null, question: "", answer: "", position: "0" };

export function FaqsManager({ faqs: initialFaqs }: { faqs: BookFaq[] }) {
  const faqsQuery = useAdminFaqs(initialFaqs);
  const faqs = faqsQuery.data;
  const refresh = useAdminRefresh("faqs");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("Nothing to save.");
      const body = { question: draft.question, answer: draft.answer, position: Number(draft.position) };
      await adminWrite(draft.id ? `/api/faqs/${draft.id}` : "/api/faqs", draft.id ? "PATCH" : "POST", body);
    },
    onSuccess: async () => {
      setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The FAQ could not be saved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (faq: BookFaq) => {
      if (!faq.id) throw new Error("This FAQ cannot be deleted.");
      await adminWrite(`/api/faqs/${faq.id}`, "DELETE");
      return faq.id;
    },
    onSuccess: async (id) => {
      if (draft?.id === id) setDraft(null);
      setError("");
      await refresh();
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The FAQ could not be deleted.");
    },
  });

  const pending = saveMutation.isPending || deleteMutation.isPending;

  function remove(faq: BookFaq) {
    if (!faq.id) return;
    if (!window.confirm("Delete this FAQ?")) return;
    setError("");
    deleteMutation.mutate(faq);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">FAQs</h1>
        <Button type="button" onClick={() => { setError(""); setDraft({ ...emptyDraft, position: String(faqs.length) }); }}>
          Add FAQ
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
          <label className={labelClass}>
            Question
            <input className={fieldClass} value={draft.question} required onChange={(event) => setDraft({ ...draft, question: event.target.value })} />
          </label>
          <label className={labelClass}>
            Answer
            <textarea className={`${fieldClass} h-28 py-2`} value={draft.answer} required onChange={(event) => setDraft({ ...draft, answer: event.target.value })} />
          </label>
          <label className={`${labelClass} max-w-[140px]`}>
            Position
            <input className={fieldClass} inputMode="numeric" value={draft.position} required onChange={(event) => setDraft({ ...draft, position: event.target.value })} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{draft.id ? "Save changes" : "Create FAQ"}</Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
              {["Position", "Question", "Answer", ""].map((column) => (
                <th key={column || "actions"} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#626262]" colSpan={4}>No FAQs yet.</td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id ?? faq.question} className="border-b border-[#f2f3f8] last:border-0">
                  <td className="px-4 py-3 align-top">{faq.position}</td>
                  <td className="px-4 py-3 align-top">{faq.question}</td>
                  <td className="max-w-[420px] px-4 py-3 align-top">{faq.answer}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setError("");
                          setDraft({
                            id: faq.id,
                            question: faq.question,
                            answer: faq.answer,
                            position: String(faq.position),
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => void remove(faq)}>Delete</Button>
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
