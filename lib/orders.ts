export const orderStatuses = [
  "pending",
  "awaiting",
  "confirmed",
  "transit",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type ProductKind = "hard_copy" | "e_copy";

export type DeliveryAddress = {
  country: string;
  state: string;
  town: string;
  landmark: string;
  phone: string;
};

export type CustomerOrder = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  amountKobo: number;
  unitPriceKobo: number;
  deliveryFeeKobo: number;
  status: OrderStatus;
  country: string;
  state: string;
  town: string;
  landmark: string;
  phone: string;
  productName: string;
  productSlug: string;
  kind: ProductKind;
  paystackReference: string | null;
  paystackChannel: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  transitAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  estimatedDelivery: string | null;
};

export const orderSelect =
  "id, user_id, quantity, amount_kobo, status, country, state, town, landmark, phone, paystack_reference, paystack_channel, created_at, paid_at, confirmed_at, transit_at, delivered_at, cancelled_at, estimated_delivery_on, products(name, slug, kind, price_kobo, delivery_fee_kobo)";

type ProductRow = {
  name: string;
  slug: string;
  kind: ProductKind;
  price_kobo: number;
  delivery_fee_kobo: number;
};

export type OrderRow = {
  id: string;
  user_id: string;
  quantity: number;
  amount_kobo: number;
  status: OrderStatus;
  country: string | null;
  state: string | null;
  town: string | null;
  landmark: string | null;
  phone: string | null;
  paystack_reference: string | null;
  paystack_channel: string | null;
  created_at: string;
  paid_at: string | null;
  confirmed_at?: string | null;
  transit_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  estimated_delivery_on?: string | null;
  products: ProductRow | ProductRow[] | null;
};

export function mapOrder(row: OrderRow): CustomerOrder {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;

  return {
    id: row.id,
    userId: row.user_id,
    customerName: "",
    customerEmail: "",
    quantity: row.quantity,
    amountKobo: row.amount_kobo,
    unitPriceKobo: product?.price_kobo ?? 0,
    deliveryFeeKobo: product?.delivery_fee_kobo ?? 0,
    status: row.status,
    country: row.country ?? "",
    state: row.state ?? "",
    town: row.town ?? "",
    landmark: row.landmark ?? "",
    phone: row.phone ?? "",
    productName: product?.name ?? "Book",
    productSlug: product?.slug ?? "",
    kind: product?.kind ?? "hard_copy",
    paystackReference: row.paystack_reference,
    paystackChannel: row.paystack_channel,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    confirmedAt: row.confirmed_at ?? null,
    transitAt: row.transit_at ?? null,
    deliveredAt: row.delivered_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
    estimatedDelivery: row.estimated_delivery_on ? String(row.estimated_delivery_on).slice(0, 10) : null,
  };
}
