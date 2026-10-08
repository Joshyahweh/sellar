import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mapFaq } from "@/lib/faqs";
import { defaultLegalPages, mapLegalPage } from "@/lib/legal";
import { averageRating, mapReview, type BookReview } from "@/lib/reviews";
import { formatDay } from "@/lib/money";
import { mapOrder, orderSelect, type CustomerOrder, type OrderStatus } from "@/lib/orders";
import { mapProduct, productSelect, type BookProduct } from "@/lib/products";
import { growthPercent, previousRange, withinRange, type DateRange, type Growth } from "@/lib/admin/range";

const paidStatuses = new Set<OrderStatus>(["awaiting", "confirmed", "transit", "delivered"]);

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting: "Awaiting",
  confirmed: "Confirmed",
  transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function statusLabel(status: OrderStatus) {
  return statusLabels[status];
}

export function kindLabel(kind: string) {
  return kind === "e_copy" ? "E-copy" : "Hard copy";
}

export type SalesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type StatusPoint = {
  status: OrderStatus;
  label: string;
  orders: number;
};

export type AdminDashboard = {
  revenueKobo: number;
  orderCount: number;
  paidCount: number;
  productCount: number;
  reviewCount: number;
  averageRating: number;
  revenueByProduct: SalesPoint[];
  revenueByDay: SalesPoint[];
  ordersByStatus: StatusPoint[];
  recentOrders: CustomerOrder[];
  range: DateRange;
  growth: Growth | null;
};

export async function loadAdminDashboard(admin: SupabaseClient, range: DateRange): Promise<AdminDashboard> {
  const [orders, products, reviews] = await Promise.all([
    loadOrders(admin),
    loadProducts(admin),
    loadReviews(admin),
  ]);
  const current = summarize(orders.filter((order) => withinRange(order.createdAt, range)), products, reviews.filter((review) => withinRange(review.createdAt, range)));
  const earlier = previousRange(range);
  const growth = earlier
    ? compare(
        current,
        summarize(
          orders.filter((order) => withinRange(order.createdAt, earlier)),
          products,
          reviews.filter((review) => withinRange(review.createdAt, earlier)),
        ),
      )
    : null;

  return { ...current, range, growth };
}

function summarize(orders: CustomerOrder[], products: BookProduct[], reviews: BookReview[]) {
  const paid = orders.filter((order) => paidStatuses.has(order.status));
  const revenueKobo = paid.reduce((sum, order) => sum + order.amountKobo, 0);
  const productNames = new Map<string, { revenue: number; orders: number }>();
  for (const product of products) productNames.set(product.name, { revenue: 0, orders: 0 });
  for (const order of orders) {
    const current = productNames.get(order.productName) ?? { revenue: 0, orders: 0 };
    current.orders += 1;
    if (paidStatuses.has(order.status)) current.revenue += order.amountKobo / 100;
    productNames.set(order.productName, current);
  }

  const days = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const key = order.createdAt.slice(0, 10);
    const current = days.get(key) ?? { revenue: 0, orders: 0 };
    current.orders += 1;
    if (paidStatuses.has(order.status)) current.revenue += order.amountKobo / 100;
    days.set(key, current);
  }

  const ordersByStatus = (Object.keys(statusLabels) as OrderStatus[])
    .map((status) => ({
      status,
      label: statusLabels[status],
      orders: orders.filter((order) => order.status === status).length,
    }))
    .filter((point) => point.orders > 0);

  return {
    revenueKobo,
    orderCount: orders.length,
    paidCount: paid.length,
    productCount: products.length,
    reviewCount: reviews.length,
    averageRating: reviews.length === 0 ? 0 : averageRating(reviews),
    revenueByProduct: [...productNames.entries()].map(([label, value]) => ({ label, ...value })),
    revenueByDay: [...days.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => ({ label: formatDay(`${key}T12:00:00.000Z`) || key, ...value })),
    ordersByStatus,
    recentOrders: orders.slice(0, 5),
  };
}

function compare(current: ReturnType<typeof summarize>, previous: ReturnType<typeof summarize>): Growth {
  return {
    revenue: growthPercent(current.revenueKobo, previous.revenueKobo),
    orders: growthPercent(current.orderCount, previous.orderCount),
    paid: growthPercent(current.paidCount, previous.paidCount),
    rating: growthPercent(current.averageRating, previous.averageRating),
  };
}

export async function loadOrders(admin: SupabaseClient) {
  const { data, error } = await admin.from("orders").select(orderSelect).order("created_at", { ascending: false });
  if (error || !data) return [];
  const orders = data.map((row) => mapOrder(row));
  return attachBuyers(admin, orders);
}

async function attachBuyers(admin: SupabaseClient, orders: CustomerOrder[]) {
  const ids = [...new Set(orders.map((order) => order.userId).filter(Boolean))];
  if (ids.length === 0) return orders;

  const { data } = await admin.from("profiles").select("id, full_name, email").in("id", ids);
  const buyers = new Map(
    (data ?? []).map((profile) => [
      String(profile.id),
      {
        name: String(profile.full_name ?? "").trim(),
        email: String(profile.email ?? "").trim(),
      },
    ]),
  );

  return orders.map((order) => {
    const buyer = buyers.get(order.userId);
    return {
      ...order,
      customerName: buyer?.name || "—",
      customerEmail: buyer?.email || "—",
    };
  });
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  purchased: boolean;
  books: string[];
};

export async function loadUsers(admin: SupabaseClient): Promise<AdminUser[]> {
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }),
    admin.from("orders").select("user_id, status, products(name)").in("status", [...paidStatuses]),
  ]);

  const booksByUser = new Map<string, Set<string>>();
  for (const order of orders ?? []) {
    const userId = String(order.user_id);
    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const name = product && typeof product === "object" && "name" in product ? String(product.name) : "";
    const books = booksByUser.get(userId) ?? new Set<string>();
    if (name) books.add(name);
    booksByUser.set(userId, books);
  }

  return (profiles ?? [])
    .map((profile) => {
      const books = [...(booksByUser.get(String(profile.id)) ?? [])];
      return {
        id: String(profile.id),
        name: String(profile.full_name ?? "").trim() || "—",
        email: String(profile.email ?? "").trim() || "—",
        joinedAt: String(profile.created_at),
        purchased: books.length > 0,
        books,
      };
    })
    .sort((a, b) => Number(a.purchased) - Number(b.purchased));
}

export async function loadProducts(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("products")
    .select(productSelect)
    .order("name");
  if (error || !data) return [];
  return data.map((row) =>
    mapProduct({
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      description: row.description ? String(row.description) : "",
      price_kobo: Number(row.price_kobo),
      delivery_fee_kobo: Number(row.delivery_fee_kobo),
      kind: row.kind,
      front_cover_path: row.front_cover_path ? String(row.front_cover_path) : null,
      back_cover_path: row.back_cover_path ? String(row.back_cover_path) : null,
      design_cover_path: row.design_cover_path ? String(row.design_cover_path) : null,
      file_path: row.file_path ? String(row.file_path) : null,
    }),
  ) satisfies BookProduct[];
}

export async function loadReviews(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("reviews")
    .select("id, author_name, rating, body, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) =>
    mapReview({
      id: String(row.id),
      author_name: String(row.author_name),
      rating: Number(row.rating),
      body: String(row.body),
      created_at: String(row.created_at),
    }),
  );
}

export async function loadLegalPages(admin: SupabaseClient) {
  const { data, error } = await admin.from("legal_pages").select("slug, title, body, updated_at").order("slug");
  if (error || !data?.length) return defaultLegalPages;

  const stored = new Map(
    data.flatMap((row) => {
      const page = mapLegalPage({
        slug: String(row.slug),
        title: String(row.title),
        body: String(row.body),
        updated_at: row.updated_at ? String(row.updated_at) : null,
      });
      return page ? [[page.slug, page] as const] : [];
    }),
  );

  return defaultLegalPages.map((page) => stored.get(page.slug) ?? page);
}

export async function loadFaqs(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("faqs")
    .select("id, question, answer, position")
    .order("position")
    .order("created_at");
  if (error || !data) return [];
  return data.map((row) =>
    mapFaq({
      id: String(row.id),
      question: String(row.question),
      answer: String(row.answer),
      position: Number(row.position),
    }),
  );
}
