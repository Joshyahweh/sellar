"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminDateRangePicker } from "@/components/admin/date-picker";
import { OrdersByStatusChart, RevenueByDayChart, RevenueByProductChart } from "@/components/admin/dashboard-charts";
import { GrowthLabel } from "@/components/admin/growth-label";
import { RecordTable } from "@/components/admin/record-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiJson } from "@/lib/api/browser";
import type { AdminDashboard } from "@/lib/admin/store";
import { presetRange, type DateRange } from "@/lib/admin/range";
import { formatDay, formatNgn } from "@/lib/money";
import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

type Preset = "7" | "30" | "90" | "all" | "custom";

export function DashboardView({ initialRange, initialSales }: { initialRange: DateRange; initialSales: AdminDashboard }) {
  const [preset, setPreset] = useState<Preset>("30");
  const [range, setRange] = useState<DateRange>(initialRange);
  const isInitial = range.from === initialRange.from && range.to === initialRange.to;
  const rangeReady = !(range.from && range.to && range.from > range.to);
  const salesQuery = useQuery({
    queryKey: ["admin", "dashboard", range.from ?? "", range.to ?? ""],
    queryFn: () => apiJson<AdminDashboard>(`/api/admin/dashboard?${rangeQuery(range)}`),
    initialData: isInitial ? initialSales : undefined,
    placeholderData: keepPreviousData,
    enabled: rangeReady,
  });
  const sales = salesQuery.data ?? initialSales;
  const comparing = Boolean(sales.growth) && rangeReady;

  function choose(next: Preset) {
    setPreset(next);
    if (next === "custom") return;
    if (next === "all") {
      setRange({ from: null, to: null });
      return;
    }
    setRange(presetRange(Number(next) as 7 | 30 | 90));
  }

  const stats = [
    { label: "Paid revenue", value: formatNgn(sales.revenueKobo), growth: sales.growth?.revenue },
    { label: "Orders", value: `${sales.orderCount}`, growth: sales.growth?.orders },
    { label: "Paid orders", value: `${sales.paidCount}`, growth: sales.growth?.paid },
    { label: "Average rating", value: sales.reviewCount === 0 ? "—" : sales.averageRating.toFixed(1), growth: sales.growth?.rating },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Dashboard</h1>
          <p className="mt-1 text-[14px] text-[#3d4650]">
            {sales.orderCount} {sales.orderCount === 1 ? "order" : "orders"} in this period · {sales.reviewCount} {sales.reviewCount === 1 ? "review" : "reviews"} · {sales.productCount} {sales.productCount === 1 ? "book" : "books"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(value) => { if (isPreset(value)) choose(value); }}>
            <SelectTrigger className="h-10 w-[140px] rounded-lg border-[#e4e8eb] bg-white px-3 text-[14px]">
              <SelectValue>{(value) => presetLabel(value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {presets.map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {preset === "custom" ? <AdminDateRangePicker value={range} onChange={setRange} className="w-[280px]" /> : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 desk:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardTitle className="text-[13px] font-medium text-[#3d4650]">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[22px] font-semibold tracking-[-0.03em]">{stat.value}</p>
              <p className={cn("mt-1 flex items-center gap-2 text-[12px] text-[#3d4650]")}>
                {comparing ? (
                  <>
                    <GrowthLabel value={stat.growth ?? null} />
                    <span>vs previous period</span>
                  </>
                ) : range.from || range.to ? (
                  "Choose a start and end date"
                ) : (
                  "All time"
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 desk:grid-cols-2">
        <RevenueByDayChart points={sales.revenueByDay} growth={comparing ? sales.growth?.revenue : undefined} />
        <RevenueByProductChart points={sales.revenueByProduct} growth={comparing ? sales.growth?.revenue : undefined} />
      </div>
      <OrdersByStatusChart points={sales.ordersByStatus} growth={comparing ? sales.growth?.orders : undefined} />
      <section className="flex flex-col gap-3">
        <h2 className="text-[18px] font-semibold">Recent orders</h2>
        <RecordTable
          columns={["Date", "Name", "Email", "Book", "Format", "Status", "Amount"]}
          empty="No orders in this period."
          rows={sales.recentOrders.map((order) => [
            formatDay(order.createdAt),
            order.customerName,
            order.customerEmail,
            order.productName,
            kindLabel(order.kind),
            statusText(order.status),
            formatNgn(order.amountKobo),
          ])}
        />
      </section>
    </div>
  );
}

const presets = [
  ["7", "7 days"],
  ["30", "30 days"],
  ["90", "90 days"],
  ["all", "All time"],
  ["custom", "Custom"],
] as const;

function isPreset(value: unknown): value is Preset {
  return value === "7" || value === "30" || value === "90" || value === "all" || value === "custom";
}

function presetLabel(value: unknown) {
  return presets.find(([key]) => key === value)?.[1] ?? "30 days";
}

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

function rangeQuery(range: DateRange) {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  return params.toString();
}
