import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="flex w-full flex-col items-center gap-5 px-5 pt-8 pb-10">
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="hidden gap-4 desk:flex">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-16" />
          ))}
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-4 w-40" />
      <Skeleton className="h-14 w-full max-w-[420px]" />
      <Skeleton className="h-4 w-full max-w-[520px]" />
      <Skeleton className="h-4 w-full max-w-[460px]" />
      <Skeleton className="h-12 w-40 rounded-full" />
      <div className="mt-4 grid h-[280px] w-full max-w-[902px] grid-cols-2 gap-3 sm:h-[360px]">
        <Skeleton className="h-full rounded-none" />
        <Skeleton className="h-full rounded-none" />
      </div>
    </section>
  );
}

export function FormatsSkeleton() {
  return (
    <section className="w-full bg-[#f8f8f8] px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-5">
        <Skeleton className="h-8 w-72" />
        <div className="flex flex-col gap-3 md:flex-row">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex w-full gap-3 bg-white p-4 md:w-1/2">
              <Skeleton className="h-[180px] w-[158px] shrink-0" />
              <div className="flex flex-1 flex-col gap-3 py-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-36 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsSkeleton() {
  return (
    <section className="w-full bg-white px-5 py-10">
      <div className="mx-auto flex w-full max-w-[868px] flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-80 max-w-full" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-[12px] bg-[#eff2f4] px-5 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AuthorSkeleton() {
  return (
    <section className="w-full px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1059px] flex-col-reverse items-center gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full max-w-[360px] shrink-0" />
      </div>
    </section>
  );
}

export function FaqSkeleton() {
  return (
    <section className="w-full px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1268px] flex-col gap-8 desk:flex-row">
        <div className="flex w-full flex-col gap-3 desk:w-[320px]">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-[8px]" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-[8px]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBookSkeleton() {
  return (
    <section className="w-full bg-white px-5 py-10">
      <div className="mx-auto flex w-full max-w-[959px] flex-col gap-5">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col-reverse items-center gap-6 md:flex-row">
          <div className="flex w-full flex-col gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-[258px] w-[185px] shrink-0" />
        </div>
      </div>
    </section>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="w-full px-5 py-10">
      <div className="mx-auto flex w-full max-w-[1268px] flex-col gap-6">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-24" />
          ))}
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </footer>
  );
}

export function LandingSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <FormatsSkeleton />
      <ReviewsSkeleton />
      <AuthorSkeleton />
      <FaqSkeleton />
      <AboutBookSkeleton />
      <FooterSkeleton />
    </>
  );
}

export function AccountPageSkeleton({ titleWidth = "w-32" }: { titleWidth?: string }) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd] pb-16">
      <div className="flex items-center justify-between px-5 pt-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-[1132px] px-4 pt-10">
        <Skeleton className={`h-8 ${titleWidth}`} />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl lg:w-[360px]" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd]">
      <div className="flex items-center justify-between px-5 pt-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-[560px] px-4 pt-16">
        <Skeleton className="h-8 w-28" />
        <div className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutCardSkeleton() {
  return (
    <div className="w-full max-w-[480px] rounded-[16px] bg-white px-5 py-6 shadow-[0_8px_32px_rgba(20,24,27,0.08)]">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-5 h-36 w-full rounded-[8px]" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-12 w-9" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-full" />
    </div>
  );
}

export function DownloadSkeleton() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1440px] bg-[#fdfdfd]">
      <div className="flex items-center justify-between px-5 pt-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="mx-auto mt-8 w-full max-w-[722px] bg-white p-5 shadow-[0_8px_32px_rgba(20,24,27,0.08)] sm:p-10">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-5 h-12 w-full" />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row">
          <Skeleton className="mx-auto h-[220px] w-[158px]" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
