import { LoadingBrand } from "@/components/layout/loading-brand";
import { SearchLoadingSkeleton } from "@/features/search/components/loading-skeleton";

export default function SearchLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <LoadingBrand />
      <SearchLoadingSkeleton />
    </div>
  );
}
