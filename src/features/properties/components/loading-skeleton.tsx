import { Skeleton } from "@/components/ui/skeleton";

export function PropertyDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <GallerySkeleton />
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <BlockSkeleton rows={2} />
          <BlockSkeleton rows={3} />
          <BlockSkeleton rows={4} />
          <BlockSkeleton rows={3} />
          <MediaSkeleton />
        </div>
        <div className="space-y-6">
          <BlockSkeleton rows={4} />
          <BlockSkeleton rows={3} />
        </div>
      </div>
      <BlockSkeleton rows={2} tall />
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl md:aspect-[21/9]" />
      <div className="flex gap-2 overflow-hidden md:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="size-16 shrink-0 rounded-xl sm:size-20 md:size-24" />
        ))}
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="rounded-xl border p-6 md:p-8">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-4 h-8 w-72 max-w-full" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function BlockSkeleton({ rows, tall = false }: { rows: number; tall?: boolean }) {
  return (
    <div className="rounded-xl border p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className={`mt-6 space-y-3 ${tall ? "grid gap-4 md:grid-cols-4" : ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={tall ? "h-28 rounded-xl" : "h-10 w-full"} />
        ))}
      </div>
    </div>
  );
}

function MediaSkeleton() {
  return (
    <div className="rounded-xl border p-6">
      <Skeleton className="h-4 w-24" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
