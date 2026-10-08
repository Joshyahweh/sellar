import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ columns, rows = 4 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#14181b]/10">
      <div className="flex gap-4 border-b border-[#f2f3f8] px-4 py-3">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-4 border-b border-[#f2f3f8] px-4 py-4 last:border-0">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminListSkeleton({ columns }: { columns: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <TableSkeleton columns={columns} />
    </div>
  );
}

export function AdminOrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-32" />
      <TableSkeleton columns={6} rows={5} />
    </div>
  );
}

export function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <TableSkeleton columns={5} rows={5} />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 desk:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[92px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 desk:grid-cols-2">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
      <Skeleton className="h-[280px] rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-36" />
        <TableSkeleton columns={5} rows={4} />
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-[#e8edf5]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 desk:flex-row desk:px-6 desk:py-6">
        <aside className="desk:w-[252px] desk:shrink-0">
          <div className="rounded-[20px] bg-white p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="size-10 rounded-[12px]" />
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            </div>
            <div className="mt-3 flex gap-1 overflow-hidden desk:flex-col">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-28 shrink-0 rounded-[12px] desk:w-full" />
              ))}
            </div>
            <Skeleton className="mt-3 h-10 w-full rounded-[12px]" />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <AdminDashboardSkeleton />
        </div>
      </div>
    </div>
  );
}
