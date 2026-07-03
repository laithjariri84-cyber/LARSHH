import { Skeleton } from "@/components/ui/skeleton";

export function SearchLoadingSkeleton() {
  return (
    <div className="animate-page-enter space-y-6">
      <FiltersSkeleton />
      <CardGridSkeleton />
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="larssh-card rounded-2xl p-6">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="larssh-card overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="larssh-card overflow-hidden rounded-2xl">
      <div className="border-b border-white/5 p-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-0 p-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-white/5 px-4 py-3 last:border-0">
            {Array.from({ length: 6 }).map((__, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
