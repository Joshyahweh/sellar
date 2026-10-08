"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { InfiniteSentinel } from "@/components/admin/infinite-sentinel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiJson } from "@/lib/api/browser";
import type { AdminUser } from "@/lib/admin/store";
import type { ListPage } from "@/lib/admin/pages";
import { formatDay } from "@/lib/money";
import { useDebounced } from "@/components/admin/use-debounced";

export function UsersManager({ firstPage }: { firstPage: ListPage<AdminUser> & { waiting: number } }) {
  const [search, setSearch] = useState("");
  const [purchased, setPurchased] = useState<"" | "yes" | "no">("");
  const q = useDebounced(search);
  const isDefault = q === "" && purchased === "";
  const usersQuery = useInfiniteQuery({
    queryKey: ["admin", "users", q, purchased],
    queryFn: ({ pageParam }) => apiJson<ListPage<AdminUser> & { waiting: number }>(`/api/admin/users?${queryString(pageParam, q, purchased)}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialData: isDefault ? { pages: [firstPage], pageParams: [0] } : undefined,
  });
  const pages = usersQuery.data?.pages ?? [];
  const users = pages.flatMap((page) => page.items);
  const waiting = pages[0]?.waiting ?? 0;
  const total = pages[0]?.total ?? 0;
  const summary =
    purchased === "no"
      ? total === 0
        ? "No one without a purchase matches these filters."
        : `${total} ${total === 1 ? "person has" : "people have"} not purchased a book.`
      : purchased === "yes"
        ? `${total} ${total === 1 ? "person has" : "people have"} purchased a book.`
        : waiting === 0
          ? "Everyone in this list has purchased a book."
          : `${waiting} ${waiting === 1 ? "person has" : "people have"} not purchased a book.`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Users</h1>
        <p className="mt-1 text-[14px] text-[#3d4650]">{summary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#e4e8eb] bg-white px-3 text-[14px]"
          value={search}
          placeholder="Search name or email"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={purchased || "all"} onValueChange={(value) => setPurchased(value === "yes" || value === "no" ? value : "")}>
          <SelectTrigger className="h-10 w-[180px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
            <SelectValue>{(value) => (value === "yes" ? "Purchased" : value === "no" ? "Not purchased" : "All users")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="yes">Purchased</SelectItem>
            <SelectItem value="no">Not purchased</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#3d4650] uppercase">
              {["Name", "Email", "Joined", "Purchased", "Books"].map((column) => (
                <th key={column} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#3d4650]" colSpan={5}>No users match these filters.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[#f2f3f8] last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{formatDay(user.joinedAt)}</td>
                  <td className="px-4 py-3">{user.purchased ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{user.books.join(", ") || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <InfiniteSentinel enabled={Boolean(usersQuery.hasNextPage) && !usersQuery.isFetchingNextPage} onVisible={() => void usersQuery.fetchNextPage()} />
      {usersQuery.isFetchingNextPage ? <p className="text-center text-[13px] text-[#3d4650]">Loading more users…</p> : null}
    </div>
  );
}

function queryString(page: number, q: string, purchased: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (purchased) params.set("purchased", purchased);
  return params.toString();
}
