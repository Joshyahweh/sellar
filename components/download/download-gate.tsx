import { Suspense } from "react";
import { DownloadModal } from "@/components/download/download-modal";
import { DownloadSkeleton } from "@/components/landing/section-skeletons";
import { formatNgn } from "@/lib/money";
import { hasPaidEcopy } from "@/lib/orders.server";
import { defaultProductFor } from "@/lib/products";
import { listBookProducts } from "@/lib/products.server";
import { createClient } from "@/lib/supabase/server";

async function DownloadGate({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  const { format } = await searchParams;
  const slug = format && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(format) ? format : "e-copy";
  const products = await listBookProducts().catch(() => []);
  const product = products.find((item) => item.slug === slug && item.kind === "e_copy") ?? defaultProductFor("e_copy");
  const priceLabel = formatNgn(product.priceKobo);

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    const coverUrl = product.designCoverUrl || product.frontCoverUrl;
    if (!data.user) return <DownloadModal mode="guest" format={product.slug} priceLabel={priceLabel} coverUrl={coverUrl} />;
    if (await hasPaidEcopy(product.slug)) return <DownloadModal mode="ready" format={product.slug} priceLabel={priceLabel} coverUrl={coverUrl} />;
    return <DownloadModal mode="pay" format={product.slug} priceLabel={priceLabel} coverUrl={coverUrl} />;
  } catch {
    return <DownloadModal mode="guest" format={product.slug} priceLabel={priceLabel} coverUrl={product.designCoverUrl || product.frontCoverUrl} />;
  }
}

export function DownloadExperience({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  return (
    <Suspense fallback={<DownloadSkeleton />}>
      <DownloadGate searchParams={searchParams} />
    </Suspense>
  );
}
