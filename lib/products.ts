import type { ProductKind } from "@/lib/orders";

export type BookProduct = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  priceKobo: number;
  deliveryFeeKobo: number;
  kind: ProductKind;
  frontCoverUrl: string | null;
  backCoverUrl: string | null;
  designCoverUrl: string | null;
  hasEbook: boolean;
};

export const productSelect =
  "id, slug, name, description, price_kobo, delivery_fee_kobo, kind, front_cover_path, back_cover_path, design_cover_path, file_path";

export function coverPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/covers/${path}`;
}

export function catalogCovers(products: BookProduct[]) {
  const ranked = [...products].sort(
    (left, right) => Number(left.kind === "e_copy") - Number(right.kind === "e_copy"),
  );
  const first = (pick: (product: BookProduct) => string | null) =>
    ranked.map(pick).find((url): url is string => Boolean(url)) ?? null;

  return {
    front: first((product) => product.frontCoverUrl),
    back: first((product) => product.backCoverUrl),
    design: first((product) => product.designCoverUrl || product.frontCoverUrl),
  };
}

export const defaultBookProducts: BookProduct[] = [
  {
    id: null,
    slug: "hard-copy",
    name: "Hard copy",
    description: "A beautiful printed copy delivered to your door step",
    priceKobo: 350_000,
    deliveryFeeKobo: 190_200,
    kind: "hard_copy",
    frontCoverUrl: null,
    backCoverUrl: null,
    designCoverUrl: null,
    hasEbook: false,
  },
  {
    id: null,
    slug: "e-copy",
    name: "E-copy",
    description: "Read instantly on your device. Available in PDF format",
    priceKobo: 350_000,
    deliveryFeeKobo: 0,
    kind: "e_copy",
    frontCoverUrl: null,
    backCoverUrl: null,
    designCoverUrl: null,
    hasEbook: false,
  },
];

const defaultsByKind = {
  hard_copy: defaultBookProducts[0],
  e_copy: defaultBookProducts[1],
} as const;

export function defaultProductFor(kind: ProductKind) {
  return defaultsByKind[kind];
}

export function normalizeProductKind(value: unknown): ProductKind | null {
  const kind = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  if (kind === "e-book" || kind === "ebook" || kind === "e-copy" || kind === "ecopy") {
    return "e_copy";
  }
  if (kind === "hard-copy" || kind === "hardcopy" || kind === "hard-book" || kind === "hardbook") {
    return "hard_copy";
  }
  return null;
}

export function slugifyProduct(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function moneyToKobo(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount);
}

export function productFromInput(input: {
  kind: ProductKind;
  name?: unknown;
  description?: unknown;
  slug?: unknown;
  priceKobo?: unknown;
  priceNaira?: unknown;
  deliveryFeeKobo?: unknown;
  deliveryFeeNaira?: unknown;
}) {
  const defaults = defaultProductFor(input.kind);
  const name = String(input.name ?? "").trim() || defaults.name;
  const description = String(input.description ?? "").trim() || defaults.description;
  const slug = slugifyProduct(String(input.slug ?? "")) || defaults.slug;
  const priceKobo =
    input.priceKobo === undefined || input.priceKobo === null || input.priceKobo === ""
      ? input.priceNaira === undefined || input.priceNaira === null || input.priceNaira === ""
        ? defaults.priceKobo
        : moneyToKobo(Number(input.priceNaira) * 100)
      : moneyToKobo(input.priceKobo);
  const deliveryFeeKobo =
    input.deliveryFeeKobo === undefined ||
    input.deliveryFeeKobo === null ||
    input.deliveryFeeKobo === ""
      ? input.deliveryFeeNaira === undefined ||
        input.deliveryFeeNaira === null ||
        input.deliveryFeeNaira === ""
        ? defaults.deliveryFeeKobo
        : moneyToKobo(Number(input.deliveryFeeNaira) * 100)
      : moneyToKobo(input.deliveryFeeKobo);

  if (name.length < 2 || name.length > 80) {
    return { error: "Name must be between 2 and 80 characters." };
  }
  if (description.length > 500) {
    return { error: "Description must be 500 characters or fewer." };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug can only use lowercase letters, numbers, and hyphens." };
  }
  if (priceKobo === null || deliveryFeeKobo === null) {
    return { error: "Price and delivery fee must be zero or greater." };
  }

  return {
    product: {
      slug,
      name,
      description,
      price_kobo: priceKobo,
      delivery_fee_kobo: deliveryFeeKobo,
      kind: input.kind,
    },
  };
}

export function productUpdateFromInput(
  existing: BookProduct,
  input: {
    kind?: unknown;
    name?: unknown;
    description?: unknown;
    slug?: unknown;
    priceKobo?: unknown;
    priceNaira?: unknown;
    deliveryFeeKobo?: unknown;
    deliveryFeeNaira?: unknown;
  },
) {
  const kind =
    input.kind === undefined || input.kind === null || input.kind === ""
      ? existing.kind
      : normalizeProductKind(input.kind);
  if (!kind) return { error: "kind must be e-book or hard-copy." };

  const priceProvided = input.priceKobo !== undefined || input.priceNaira !== undefined;
  const deliveryProvided =
    input.deliveryFeeKobo !== undefined || input.deliveryFeeNaira !== undefined;

  return productFromInput({
    kind,
    name: input.name === undefined ? existing.name : input.name,
    description: input.description === undefined ? existing.description : input.description,
    slug: input.slug === undefined ? existing.slug : input.slug,
    priceKobo: priceProvided ? input.priceKobo : existing.priceKobo,
    priceNaira: priceProvided ? input.priceNaira : undefined,
    deliveryFeeKobo: deliveryProvided ? input.deliveryFeeKobo : existing.deliveryFeeKobo,
    deliveryFeeNaira: deliveryProvided ? input.deliveryFeeNaira : undefined,
  });
}

export function mapProduct(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_kobo: number;
  delivery_fee_kobo: number;
  kind: ProductKind;
  front_cover_path?: string | null;
  back_cover_path?: string | null;
  design_cover_path?: string | null;
  file_path?: string | null;
}): BookProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    priceKobo: row.price_kobo,
    deliveryFeeKobo: row.delivery_fee_kobo,
    kind: row.kind,
    frontCoverUrl: coverPublicUrl(row.front_cover_path),
    backCoverUrl: coverPublicUrl(row.back_cover_path),
    designCoverUrl: coverPublicUrl(row.design_cover_path),
    hasEbook: Boolean(row.file_path),
  };
}
