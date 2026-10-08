"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, TickCircleIcon } from "@/components/icons";
import { HeaderNav } from "@/components/landing/header-nav";
import { formatDay, formatNgn, formatPlaced } from "@/lib/money";
import type { CustomerOrder, OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

type OrderTab = "ongoing" | "delivered" | "cancelled";

const statusClass: Record<OrderStatus, string> = {
  pending: "bg-[#eef6fb] text-[#048bdc]",
  awaiting: "bg-[#f5c451] text-white",
  transit: "bg-[#48b4e8] text-white",
  confirmed: "bg-[#3cb371] text-white",
  delivered: "bg-[#14181b] text-white",
  cancelled: "bg-[#a5a5a5] text-white",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  awaiting: "Awaiting confirmation",
  transit: "Order on transit",
  confirmed: "Order confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusRank: Record<OrderStatus, number> = {
  pending: 0,
  awaiting: 1,
  confirmed: 2,
  transit: 3,
  delivered: 4,
  cancelled: -1,
};

const trackingSteps = [
  { title: "Order placed", detail: "We received your order" },
  { title: "Order confirmed", detail: "The store confirmed your order" },
  { title: "Order on transit", detail: "Your order is on the way" },
  { title: "Delivered", detail: "Your order has been delivered" },
];

export function OrdersView({ orders }: { orders: CustomerOrder[] }) {
  const [tab, setTab] = useState<OrderTab>("ongoing");
  const [selected, setSelected] = useState<string | null>(null);

  const trackable = useMemo(
    () => orders.filter((order) => order.kind !== "e_copy"),
    [orders],
  );

  const visible = useMemo(() => {
    return trackable.filter((order) => {
      if (tab === "delivered") return order.status === "delivered";
      if (tab === "cancelled") return order.status === "cancelled";
      return order.status !== "delivered" && order.status !== "cancelled";
    });
  }, [trackable, tab]);

  const counts = {
    ongoing: trackable.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length,
    delivered: trackable.filter((order) => order.status === "delivered").length,
    cancelled: trackable.filter((order) => order.status === "cancelled").length,
  };

  const selectedOrder = visible.find((order) => order.id === selected) ?? null;

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd] pb-16 desk:min-h-[923px] desk:pb-[80px]">
      <HeaderNav variant="orders" />
      <div className="mx-auto w-full max-w-[1132px] px-4 pt-6 desk:px-0 desk:pt-[120px]">
        <div className="flex items-center gap-[8px]">
          <Link href="/home" aria-label="Back">
            <ArrowLeftIcon size={22} color="#14181b" />
          </Link>
          <h1 className="m-0 font-semibold text-[24px] leading-[29px] text-[#14181b]">
            {tab === "delivered" ? "Your Orders" : "Order"}
          </h1>
        </div>

        <div className="mt-[20px] flex items-center gap-4 overflow-x-auto border-b border-solid border-[#eef0f2] desk:gap-[24px]">
          {(
            [
              ["ongoing", "Ongoing order", counts.ongoing],
              ["delivered", "Delivered order", counts.delivered],
              ["cancelled", "Cancelled order", counts.cancelled],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={cn(
                "relative flex shrink-0 cursor-pointer items-center gap-[8px] border-0 bg-transparent pb-[12px] font-medium text-[14px] leading-[17px]",
                tab === key ? "text-[#296cf0]" : "text-[#a5a5a5]",
              )}
              onClick={() => {
                setTab(key);
                setSelected(null);
              }}
            >
              {label}
              {count > 0 && tab === key ? (
                <span className="flex size-[20px] items-center justify-center rounded-full bg-[#296cf0] font-medium text-[11px] text-white">
                  {count}
                </span>
              ) : null}
              {tab === key ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-[#296cf0]" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-[24px] flex flex-col items-stretch gap-6 lg:flex-row lg:items-start desk:gap-[24px]">
          <div className="flex w-full flex-col gap-[12px] lg:w-[430px] lg:shrink-0">
            {visible.length === 0 ? (
              <p className="px-[16px] py-[16px] font-normal text-[14px] leading-[20px] text-[#a5a5a5]">
                No orders in this tab yet.
              </p>
            ) : null}
            {visible.map((order) => (
              <button
                key={order.id}
                type="button"
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[12px] border border-solid bg-white px-[16px] py-[16px] text-left",
                  selected === order.id
                    ? "border-[#e4e8eb] shadow-[0_8px_24px_rgba(20,24,27,0.06)]"
                    : "border-transparent",
                )}
                onClick={() => setSelected(order.id)}
              >
                <div>
                  <p className="font-medium text-[14px] leading-[17px] text-[#14181b]">
                    {order.productName}
                  </p>
                  <p className="mt-[4px] font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
                    {formatPlaced(order.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-[20px] px-[10px] py-[6px] font-medium text-[11px] leading-[13px] whitespace-nowrap",
                    statusClass[order.status],
                  )}
                >
                  {statusLabel[order.status]}
                </span>
              </button>
            ))}
          </div>

          <div className="min-h-[280px] flex-1 rounded-[12px] bg-[#f5f6f8] p-4 sm:min-h-[520px] sm:p-[24px]">
            {selectedOrder ? (
              <OrderDetail order={selectedOrder} />
            ) : (
              <div className="flex h-full min-h-[480px] items-center justify-center">
                <p className="w-[220px] text-center font-normal text-[14px] leading-[20px] text-[#a5a5a5]">
                  No order has been selected, click on order to display order
                  detail here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function stepDates(order: CustomerOrder) {
  const placed = order.paidAt ?? (order.status === "pending" ? null : order.createdAt);
  return [placed, order.confirmedAt, order.transitAt, order.deliveredAt];
}

function stepReached(order: CustomerOrder, index: number) {
  if (order.status === "cancelled") return Boolean(stepDates(order)[index]);
  return statusRank[order.status] > index;
}

function trackingDate(order: CustomerOrder, index: number) {
  const value = stepDates(order)[index];
  if (!stepReached(order, index) || !value) return "";
  return formatDay(value);
}

function deliveryEstimate(order: CustomerOrder) {
  if (!order.estimatedDelivery) return "To be confirmed";
  return formatDay(`${order.estimatedDelivery}T12:00:00.000Z`);
}

function OrderDetail({ order }: { order: CustomerOrder }) {
  return (
    <div className="rounded-[12px] bg-white p-[20px]">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[16px] leading-[19px] text-[#14181b]">
          {order.productName}
        </p>
        <span className={cn("rounded-[20px] px-[10px] py-[6px] font-medium text-[11px]", statusClass[order.status])}>
          {statusLabel[order.status]}
        </span>
      </div>

      <div className="mt-[20px] grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[16px]">
        <div>
          <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
            Estimated delivery date
          </p>
          <p className="mt-[4px] font-medium text-[14px] leading-[17px] text-[#14181b]">
            {deliveryEstimate(order)}
          </p>
        </div>
        <div>
          <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
            Quantity placed
          </p>
          <p className="mt-[4px] font-medium text-[14px] leading-[17px] text-[#14181b]">
            {order.quantity}
          </p>
        </div>
      </div>

      <p className="mt-[24px] font-medium text-[14px] leading-[17px] text-[#14181b]">
        Tracking status
      </p>
      <div className="mt-[12px] flex flex-col">
        {trackingSteps.map((step, index) => (
          <div key={step.title} className="flex gap-[12px]">
            <div className="flex flex-col items-center">
              <TickCircleIcon
                size={20}
                color={stepReached(order, index) ? "#16a34a" : "#a5a5a5"}
              />
              {index < trackingSteps.length - 1 ? (
                <span className="my-[2px] h-[36px] w-px bg-[#cfead8]" />
              ) : null}
            </div>
            <div className="flex flex-1 items-start justify-between pb-[12px]">
              <div>
                <p className="font-medium text-[13px] leading-[16px] text-[#14181b]">
                  {step.title}
                </p>
                <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
                  {step.detail}
                </p>
              </div>
              <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
                {trackingDate(order, index)}
              </p>
            </div>
          </div>
        ))}
        {order.status === "cancelled" ? (
          <div className="flex gap-[12px]">
            <TickCircleIcon size={20} color="#a5a5a5" />
            <div className="flex flex-1 items-start justify-between">
              <div>
                <p className="font-medium text-[13px] leading-[16px] text-[#14181b]">Cancelled</p>
                <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">This order will not be delivered</p>
              </div>
              <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">
                {order.cancelledAt ? formatDay(order.cancelledAt) : ""}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-[8px] grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-[16px]">
        <div>
          <p className="mb-[8px] font-medium text-[14px] leading-[17px] text-[#14181b]">
            Payment information
          </p>
          <Summary label="Payment method" value={order.paystackChannel ?? "Paystack"} />
          <p className="mt-[10px] font-medium text-[12px] text-[#14181b]">
            Payment detail
          </p>
          <Summary label="Item/s cost" value={formatNgn(order.unitPriceKobo * order.quantity)} />
          <Summary label="Delivery fee" value={formatNgn(order.deliveryFeeKobo)} />
          <Summary label="Total" value={formatNgn(order.amountKobo)} />
        </div>
        <div>
          <p className="mb-[8px] font-medium text-[14px] leading-[17px] text-[#14181b]">
            Delivery information
          </p>
          <Summary label="State" value={order.state || "—"} />
          <Summary label="City" value={order.town || "—"} />
          <Summary label="Nearest landmark" value={order.landmark || "—"} />
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-[6px] flex items-start justify-between gap-[12px]">
      <p className="font-normal text-[12px] leading-[15px] text-[#a5a5a5]">{label}</p>
      <p className="max-w-[180px] text-right font-medium text-[12px] leading-[15px] text-[#14181b]">
        {value}
      </p>
    </div>
  );
}
