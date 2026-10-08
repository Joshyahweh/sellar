"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { GrowthLabel } from "@/components/admin/growth-label";
import type { SalesPoint, StatusPoint } from "@/lib/admin/store";

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const statusConfig = {
  pending: { label: "Pending", color: "var(--chart-5)" },
  awaiting: { label: "Awaiting", color: "var(--chart-3)" },
  confirmed: { label: "Confirmed", color: "var(--chart-4)" },
  transit: { label: "In transit", color: "var(--chart-1)" },
  delivered: { label: "Delivered", color: "var(--chart-2)" },
  cancelled: { label: "Cancelled", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function naira(value: number) {
  return `NGN ${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RevenueByDayChart({ points, growth }: { points: SalesPoint[]; growth?: number | null }) {
  return (
    <Card>
      <CardHeader>
        <ChartHeading title="Revenue over time" description="Paid orders grouped by the day they were placed." growth={growth} />
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <EmptyChart label="No paid orders yet." />
        ) : (
          <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={points} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(value) => Number(value).toLocaleString("en-NG")} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => naira(Number(value))} />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} maxBarSize={72} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueByProductChart({ points, growth }: { points: SalesPoint[]; growth?: number | null }) {
  return (
    <Card>
      <CardHeader>
        <ChartHeading title="Revenue by book" description="What each format has earned from paid orders." growth={growth} />
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <EmptyChart label="No books to chart yet." />
        ) : (
          <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={points} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(value) => Number(value).toLocaleString("en-NG")} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => naira(Number(value))} />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} maxBarSize={72} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function OrdersByStatusChart({ points, growth }: { points: StatusPoint[]; growth?: number | null }) {
  const data = points.map((point) => ({
    ...point,
    fill: `var(--color-${point.status})`,
  }));

  return (
    <Card>
      <CardHeader>
        <ChartHeading title="Orders by status" description="How orders in this period are moving." growth={growth} />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart label="No orders yet." />
        ) : (
          <ChartContainer config={statusConfig} className="mx-auto aspect-auto h-[260px] w-full max-w-[360px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
              <Pie data={data} dataKey="orders" nameKey="status" innerRadius={58} strokeWidth={2} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ChartHeading({ title, description, growth }: { title: string; description: string; growth?: number | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {growth !== undefined ? <GrowthLabel value={growth} /> : null}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <p className="flex h-[260px] items-center justify-center text-[14px] text-[#626262]">{label}</p>;
}
