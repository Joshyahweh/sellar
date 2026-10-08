"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { InfiniteSentinel } from "@/components/admin/infinite-sentinel";
import { useDebounced } from "@/components/admin/use-debounced";
import { apiJson } from "@/lib/api/browser";
import type { Enquiry, ListPage } from "@/lib/admin/pages";
import { formatDay } from "@/lib/money";

export function EnquiriesManager({ firstPage }: { firstPage: ListPage<Enquiry> }) {
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const messagesQuery = useInfiniteQuery({
    queryKey: ["admin", "enquiries", q],
    queryFn: ({ pageParam }) =>
      apiJson<ListPage<Enquiry>>(`/api/admin/enquiries?${messagesQueryString(pageParam, q)}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialData: q === "" ? { pages: [firstPage], pageParams: [0] } : undefined,
    placeholderData: keepPreviousData,
  });
  const messages = messagesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = messagesQuery.data?.pages[0]?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Messages</h1>
        <p className="mt-1 text-[14px] text-[#3d4650]">
          {total} {total === 1 ? "message" : "messages"} from Contact us.
        </p>
      </div>
      <input
        className="h-10 max-w-[420px] rounded-lg border border-[#e4e8eb] bg-white px-3 text-[14px]"
        value={search}
        placeholder="Search name, email, subject, or message"
        onChange={(event) => setSearch(event.target.value)}
      />
      {messages.length === 0 ? (
        <div className="rounded-xl bg-white px-4 py-10 text-center text-[14px] text-[#626262] ring-1 ring-[#14181b]/10">
          {total === 0 && q === "" ? "No messages yet." : "No messages match this search."}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li key={message.id} className="rounded-xl bg-white p-4 ring-1 ring-[#14181b]/10">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-[#14181b]">{message.fullName}</p>
                  <a className="text-[14px] text-[#296cf0]" href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject)}`}>
                    {message.email}
                  </a>
                </div>
                <p className="text-[13px] text-[#626262]">{formatDay(message.createdAt)}</p>
              </div>
              <p className="mt-3 text-[15px] font-medium text-[#14181b]">{message.subject}</p>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[#3d4650]">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
      <InfiniteSentinel
        enabled={Boolean(messagesQuery.hasNextPage) && !messagesQuery.isFetchingNextPage}
        onVisible={() => void messagesQuery.fetchNextPage()}
      />
      {messagesQuery.isFetchingNextPage ? (
        <p className="text-center text-[13px] text-[#3d4650]">Loading more messages…</p>
      ) : null}
    </div>
  );
}

function messagesQueryString(page: number, q: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  return params.toString();
}
