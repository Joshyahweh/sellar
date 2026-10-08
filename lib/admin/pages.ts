import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mapProduct, productSelect, type BookProduct } from "@/lib/products";
import { mapOrder, orderSelect, type CustomerOrder, type OrderRow, type OrderStatus, orderStatuses } from "@/lib/orders";
import type { AdminUser } from "@/lib/admin/store";

export const adminPageSize = 12;

const paidStatuses = ["awaiting", "confirmed", "transit", "delivered"];
const emptyId = "00000000-0000-0000-0000-000000000000";

export type ListPage<T> = {
  items: T[];
  page: number;
  nextPage: number | null;
  total: number;
};

export type OrderFilters = {
  page: number;
  q: string;
  status: OrderStatus | "";
  kind: "hard_copy" | "e_copy" | "";
  from: string | null;
  to: string | null;
};

export async function pageOrders(admin: SupabaseClient, filters: OrderFilters): Promise<ListPage<CustomerOrder>> {
  const select = filters.kind ? orderSelect.replace("products(", "products!inner(") : orderSelect;
  let query = admin.from("orders").select(select, { count: "exact" }).order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.kind) query = query.eq("products.kind", filters.kind);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const pattern = searchPattern(filters.q);
  if (pattern) {
    const [{ data: people }, { data: books }] = await Promise.all([
      admin.from("profiles").select("id").or(`full_name.ilike.${pattern},email.ilike.${pattern}`),
      admin.from("products").select("id").or(`name.ilike.${pattern},slug.ilike.${pattern}`),
    ]);
    const userIds = (people ?? []).map((person) => String(person.id));
    const productIds = (books ?? []).map((book) => String(book.id));
    if (userIds.length === 0 && productIds.length === 0) return blank(filters.page);
    const parts = [];
    if (userIds.length > 0) parts.push(`user_id.in.(${userIds.join(",")})`);
    if (productIds.length > 0) parts.push(`product_id.in.(${productIds.join(",")})`);
    query = query.or(parts.join(","));
  }

  const { data, error, count } = await query.range(filters.page * adminPageSize, filters.page * adminPageSize + adminPageSize - 1);
  if (error || !data) return blank(filters.page);
  const orders = await attachBuyers(admin, (data as unknown as OrderRow[]).map((row) => mapOrder(row)));
  return pageResult(orders, filters.page, count ?? orders.length);
}

export async function pageUsers(
  admin: SupabaseClient,
  filters: { page: number; q: string; purchased: "" | "yes" | "no" },
): Promise<ListPage<AdminUser> & { waiting: number }> {
  const { data: paidRows } = await admin.from("orders").select("user_id, status, products(name)").in("status", paidStatuses);
  const booksByUser = new Map<string, Set<string>>();
  for (const order of paidRows ?? []) {
    const userId = String(order.user_id);
    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const name = product && typeof product === "object" && "name" in product ? String(product.name) : "";
    const books = booksByUser.get(userId) ?? new Set<string>();
    if (name) books.add(name);
    booksByUser.set(userId, books);
  }
  const paidIds = [...booksByUser.keys()];

  let query = admin.from("profiles").select("id, full_name, email, created_at", { count: "exact" }).order("created_at", { ascending: false });
  const pattern = searchPattern(filters.q);
  if (pattern) query = query.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
  if (filters.purchased === "yes") query = query.in("id", paidIds.length > 0 ? paidIds : [emptyId]);
  if (filters.purchased === "no" && paidIds.length > 0) query = query.not("id", "in", `(${paidIds.join(",")})`);

  const { data, error, count } = await query.range(filters.page * adminPageSize, filters.page * adminPageSize + adminPageSize - 1);
  if (error || !data) return { ...blank<AdminUser>(filters.page), waiting: 0 };

  const items = data.map((profile) => {
    const books = [...(booksByUser.get(String(profile.id)) ?? [])];
    return {
      id: String(profile.id),
      name: String(profile.full_name ?? "").trim() || "—",
      email: String(profile.email ?? "").trim() || "—",
      joinedAt: String(profile.created_at),
      purchased: books.length > 0,
      books,
    };
  });

  let waiting = 0;
  if (filters.purchased === "no") waiting = count ?? items.length;
  if (filters.purchased === "") {
    let waitingQuery = admin.from("profiles").select("id", { count: "exact", head: true });
    if (pattern) waitingQuery = waitingQuery.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
    if (paidIds.length > 0) waitingQuery = waitingQuery.not("id", "in", `(${paidIds.join(",")})`);
    const { count: waitingCount } = await waitingQuery;
    waiting = waitingCount ?? 0;
  }

  return { ...pageResult(items, filters.page, count ?? items.length), waiting };
}

export async function pageBooks(
  admin: SupabaseClient,
  filters: { page: number; q: string; kind: "" | "hard_copy" | "e_copy" },
): Promise<ListPage<BookProduct>> {
  let query = admin.from("products").select(productSelect, { count: "exact" }).order("name");
  if (filters.kind) query = query.eq("kind", filters.kind);
  const pattern = searchPattern(filters.q);
  if (pattern) query = query.or(`name.ilike.${pattern},slug.ilike.${pattern}`);

  const { data, error, count } = await query.range(filters.page * adminPageSize, filters.page * adminPageSize + adminPageSize - 1);
  if (error || !data) return blank(filters.page);
  const items = data.map((row) =>
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
      is_display: Boolean(row.is_display),
      about: row.about ? String(row.about) : "",
    }),
  );
  return pageResult(items, filters.page, count ?? items.length);
}

export function readPage(value: string | null) {
  const page = Number(value ?? "0");
  if (!Number.isInteger(page) || page < 0) return 0;
  return page;
}

export function readOrderStatus(value: string | null): OrderStatus | "" {
  if (!value) return "";
  return orderStatuses.includes(value as OrderStatus) ? (value as OrderStatus) : "";
}

export type Enquiry = {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export async function pageEnquiries(
  admin: SupabaseClient,
  filters: { page: number; q: string },
): Promise<ListPage<Enquiry>> {
  let query = admin
    .from("enquiries")
    .select("id, full_name, email, subject, message, created_at", { count: "exact" })
    .order("created_at", { ascending: false });
  const pattern = searchPattern(filters.q);
  if (pattern) {
    query = query.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},subject.ilike.${pattern},message.ilike.${pattern}`,
    );
  }
  const { data, error, count } = await query.range(
    filters.page * adminPageSize,
    filters.page * adminPageSize + adminPageSize - 1,
  );
  if (error || !data) return blank(filters.page);
  const items = data.map((row) => ({
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    createdAt: String(row.created_at),
  }));
  return pageResult(items, filters.page, count ?? items.length);
}

export function readKind(value: string | null): "" | "hard_copy" | "e_copy" {
  if (value === "hard_copy" || value === "e_copy") return value;
  return "";
}

function searchPattern(value: string) {
  const cleaned = value.replace(/[%_,.()]/g, " ").trim();
  if (!cleaned) return "";
  return `%${cleaned}%`;
}

function pageResult<T>(items: T[], page: number, total: number): ListPage<T> {
  const next = (page + 1) * adminPageSize < total ? page + 1 : null;
  return { items, page, nextPage: next, total };
}

function blank<T>(page: number): ListPage<T> {
  return { items: [], page, nextPage: null, total: 0 };
}

async function attachBuyers(admin: SupabaseClient, orders: CustomerOrder[]) {
  const ids = [...new Set(orders.map((order) => order.userId).filter(Boolean))];
  if (ids.length === 0) return orders;
  const { data } = await admin.from("profiles").select("id, full_name, email").in("id", ids);
  const buyers = new Map(
    (data ?? []).map((profile) => [
      String(profile.id),
      { name: String(profile.full_name ?? "").trim(), email: String(profile.email ?? "").trim() },
    ]),
  );
  return orders.map((order) => {
    const buyer = buyers.get(order.userId);
    return { ...order, customerName: buyer?.name || "—", customerEmail: buyer?.email || "—" };
  });
}
