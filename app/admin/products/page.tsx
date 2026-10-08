import { Suspense } from "react";
import { BooksManager } from "@/components/admin/books-manager";
import { AdminListSkeleton } from "@/components/admin/page-skeletons";
import { requireAdminPage } from "@/lib/admin/guard";
import { pageBooks } from "@/lib/admin/pages";

export const metadata = { title: "Books" };

async function ProductsPage() {
  const { admin } = await requireAdminPage();
  const firstPage = await pageBooks(admin, { page: 0, q: "", kind: "" });
  return <BooksManager firstPage={firstPage} />;
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminListSkeleton columns={8} />}>
      <ProductsPage />
    </Suspense>
  );
}
