"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { adminWrite } from "@/components/admin/admin-write";
import { AdminDatePicker, AdminDateRangePicker } from "@/components/admin/date-picker";
import { InfiniteSentinel } from "@/components/admin/infinite-sentinel";
import { useDebounced } from "@/components/admin/use-debounced";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiJson } from "@/lib/api/browser";
import type { ListPage } from "@/lib/admin/pages";
import { formatDay, formatNgn } from "@/lib/money";
import type { CustomerOrder, OrderStatus } from "@/lib/orders";

const actions: Partial<Record<OrderStatus, { status: OrderStatus; label: string }[]>> = {
  awaiting: [
    { status: "confirmed", label: "Confirm order" },
    { status: "cancelled", label: "Cancel order" },
  ],
  confirmed: [
    { status: "transit", label: "Mark in transit" },
    { status: "cancelled", label: "Cancel order" },
  ],
  transit: [
    { status: "delivered", label: "Mark delivered" },
    { status: "cancelled", label: "Cancel order" },
  ],
};

const statusRank: Record<OrderStatus, number> = {
  pending: 0,
  awaiting: 1,
  confirmed: 2,
  transit: 3,
  delivered: 4,
  cancelled: -1,
};

function kindLabel(kind: string) {
  return kind === "e_copy" ? "E-copy" : "Hard copy";
}

function statusText(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: "Pending",
    awaiting: "Awaiting",
    confirmed: "Confirmed",
    transit: "In transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status];
}

function showDay(value: string | null) {
  if (!value) return "—";
  const iso = value.length === 10 ? `${value}T12:00:00.000Z` : value;
  return formatDay(iso) || "—";
}

export function OrdersManager({ firstPage }: { firstPage: ListPage<CustomerOrder> }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [kind, setKind] = useState<"" | "hard_copy" | "e_copy">("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const q = useDebounced(search);
  const isDefault = q === "" && status === "" && kind === "" && !from && !to;
  const ordersQuery = useInfiniteQuery({
    queryKey: ["admin", "orders", q, status, kind, from ?? "", to ?? ""],
    queryFn: ({ pageParam }) => apiJson<ListPage<CustomerOrder>>(`/api/admin/orders?${queryString(pageParam, q, status, kind, from, to)}`),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialData: isDefault ? { pages: [firstPage], pageParams: [0] } : undefined,
    placeholderData: keepPreviousData,
  });
  const orders = ordersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = ordersQuery.data?.pages[0]?.total ?? 0;
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  const mutation = useMutation({
    mutationFn: async (input: { id: string; status?: OrderStatus; estimatedDelivery?: string }) => {
      await adminWrite(`/api/orders/${input.id}`, "PATCH", {
        ...(input.status ? { status: input.status } : {}),
        ...(input.estimatedDelivery !== undefined ? { estimatedDelivery: input.estimatedDelivery } : {}),
      });
    },
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "The order could not be updated.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Orders</h1>
        <p className="mt-1 text-[14px] text-[#3d4650]">{total} {total === 1 ? "order matches" : "orders match"} these filters.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="h-10 min-w-[220px] flex-1 rounded-lg border border-[#e4e8eb] bg-white px-3 text-[14px]"
          value={search}
          placeholder="Search name, email, or book"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={status || "all"} onValueChange={(value) => setStatus(isStatus(value) ? value : "")}>
          <SelectTrigger className="h-10 w-[160px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
            <SelectValue>{(value) => (isStatus(value) ? statusText(value) : "All statuses")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(["pending", "awaiting", "confirmed", "transit", "delivered", "cancelled"] as const).map((item) => (
              <SelectItem key={item} value={item}>{statusText(item)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={kind || "all"} onValueChange={(value) => setKind(value === "hard_copy" || value === "e_copy" ? value : "")}>
          <SelectTrigger className="h-10 w-[150px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
            <SelectValue>{(value) => (value === "e_copy" ? "E-copy" : value === "hard_copy" ? "Hard copy" : "All formats")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            <SelectItem value="hard_copy">Hard copy</SelectItem>
            <SelectItem value="e_copy">E-copy</SelectItem>
          </SelectContent>
        </Select>
        <AdminDateRangePicker value={{ from, to }} className="w-[280px]" onChange={(next) => { setFrom(next.from); setTo(next.to); }} />
        {isDefault ? null : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatus("");
              setKind("");
              setFrom(null);
              setTo(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
        <table className="w-full min-w-[980px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
              {["Date", "Name", "Email", "Book", "Format", "Qty", "Status", "Channel", "Destination", "Amount"].map((column) => (
                <th key={column} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-[#626262]" colSpan={10}>No orders match these filters.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${order.productName} for ${order.customerName}`}
                  className="cursor-pointer border-b border-[#f2f3f8] last:border-0 hover:bg-[#f6f7fb]"
                  onClick={() => {
                    setError("");
                    setSelectedId(order.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setError("");
                    setSelectedId(order.id);
                  }}
                >
                  <td className="px-4 py-3">{formatDay(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.customerEmail}</td>
                  <td className="px-4 py-3">{order.productName}</td>
                  <td className="px-4 py-3">{kindLabel(order.kind)}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">{statusText(order.status)}</td>
                  <td className="px-4 py-3">{order.paystackChannel ?? "—"}</td>
                  <td className="px-4 py-3">{[order.town, order.state, order.country].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3">{formatNgn(order.amountKobo)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <InfiniteSentinel enabled={Boolean(ordersQuery.hasNextPage) && !ordersQuery.isFetchingNextPage} onVisible={() => void ordersQuery.fetchNextPage()} />
      {ordersQuery.isFetchingNextPage ? <p className="text-center text-[13px] text-[#3d4650]">Loading more orders…</p> : null}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        {selected ? (
          <OrderDialog
            order={selected}
            error={error}
            pending={mutation.isPending}
            onStatus={(status) => {
              setError("");
              mutation.mutate({ id: selected.id, status });
            }}
            onDelivery={(estimatedDelivery) => {
              setError("");
              mutation.mutate({ id: selected.id, estimatedDelivery });
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

function OrderDialog({
  order,
  error,
  pending,
  onStatus,
  onDelivery,
}: {
  order: CustomerOrder;
  error: string;
  pending: boolean;
  onStatus: (status: OrderStatus) => void;
  onDelivery: (value: string) => void;
}) {
  const steps = order.kind === "hard_copy" ? actions[order.status] : undefined;
  const canDate = order.kind === "hard_copy" && (order.status === "awaiting" || order.status === "confirmed" || order.status === "transit");
  const destination = [order.town, order.state, order.country].filter(Boolean).join(", ") || "—";

  return (
    <DialogContent className="max-h-[min(720px,calc(100dvh-2rem))] overflow-y-auto bg-white p-6 text-[#14181b] sm:max-w-[480px]">
      <DialogHeader className="gap-1.5 pr-8">
        <DialogTitle className="text-[22px] font-semibold tracking-[-0.03em] text-[#14181b]">
          {order.productName}
        </DialogTitle>
        <DialogDescription className="text-[14px] leading-5 text-[#3d4650]">
          <span className="font-medium text-[#14181b]">{order.customerName}</span>
          <span> · {order.customerEmail}</span>
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl bg-[#f4f6f8] px-4 py-4">
        <Detail label="Status" value={<StatusBadge status={order.status} />} />
        <Detail label="Format" value={kindLabel(order.kind)} />
        <Detail label="Quantity" value={String(order.quantity)} />
        <Detail label="Amount" value={formatNgn(order.amountKobo)} />
        <Detail label="Destination" value={destination} />
        <Detail label="Channel" value={order.paystackChannel ?? "—"} />
      </dl>

      {order.kind === "hard_copy" ? (
        <div className="flex flex-col gap-4 border-t border-[#e4e8eb] pt-4">
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[#14181b]">Tracking</p>
          <ol className="flex flex-col">
            <TrackStep title="Order placed" done={statusRank[order.status] > 0 || Boolean(order.paidAt)} date={showDay(order.paidAt ?? order.createdAt)} />
            <TrackStep title="Order confirmed" done={Boolean(order.confirmedAt)} date={showDay(order.confirmedAt)} />
            <TrackStep title="Order on transit" done={Boolean(order.transitAt)} date={showDay(order.transitAt)} />
            <TrackStep title="Delivered" done={Boolean(order.deliveredAt)} date={showDay(order.deliveredAt)} />
            {order.status === "cancelled" ? (
              <TrackStep title="Cancelled" done date={showDay(order.cancelledAt)} />
            ) : null}
          </ol>
          {canDate ? (
            <div className="flex flex-col gap-1.5 text-[13px] font-semibold tracking-[0.04em] text-[#3d4650] uppercase">
              Estimated delivery
              <AdminDatePicker value={order.estimatedDelivery} disabled={pending} className="w-full" onChange={onDelivery} />
            </div>
          ) : (
            <Detail label="Estimated delivery" value={order.estimatedDelivery ? showDay(order.estimatedDelivery) : "To be confirmed"} />
          )}
          {steps ? (
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => (
                <Button
                  key={step.status}
                  type="button"
                  variant={step.status === "cancelled" ? "outline" : "default"}
                  disabled={pending}
                  onClick={() => onStatus(step.status)}
                >
                  {step.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-[#e4e8eb] pt-4 text-[14px] leading-5 text-[#3d4650]">
          An e-copy is ready to download as soon as payment is confirmed.
        </p>
      )}

      {error ? <p className="text-[14px] font-medium text-[#c4004c]">{error}</p> : null}
    </DialogContent>
  );
}

function isStatus(value: unknown): value is OrderStatus {
  return value === "pending" || value === "awaiting" || value === "confirmed" || value === "transit" || value === "delivered" || value === "cancelled";
}

function queryString(page: number, q: string, status: string, kind: string, from: string | null, to: string | null) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (kind) params.set("kind", kind);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return params.toString();
}

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-[#e7f3fb] text-[#04588f]",
  awaiting: "bg-[#f8e7b0] text-[#5c4200]",
  confirmed: "bg-[#d8f3e3] text-[#0b5c32]",
  transit: "bg-[#d5eef8] text-[#0a5578]",
  delivered: "bg-[#14181b] text-white",
  cancelled: "bg-[#e8ecef] text-[#2f3840]",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] leading-4 font-semibold ${statusTone[status]}`}>
      {statusText(status)}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold tracking-[0.04em] text-[#3d4650] uppercase">{label}</dt>
      <dd className="mt-1 text-[15px] leading-5 font-semibold text-[#14181b]">{value}</dd>
    </div>
  );
}

function TrackStep({ title, done, date }: { title: string; done: boolean; date: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-[#eef1f3] py-2.5 last:border-0">
      <span className={done ? "text-[15px] font-semibold text-[#14181b]" : "text-[15px] font-medium text-[#3d4650]"}>
        {title}
      </span>
      <span className={done ? "text-[13px] font-medium text-[#14181b]" : "text-[13px] font-medium text-[#5c6770]"}>
        {done ? date : "—"}
      </span>
    </li>
  );
}
