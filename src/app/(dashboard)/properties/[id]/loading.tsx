import { LoadingBrand } from "@/components/layout/loading-brand";
import { PropertyDetailsSkeleton } from "@/features/properties/components/loading-skeleton";

export default function PropertyDetailsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <LoadingBrand />
      <PropertyDetailsSkeleton />
    </div>
  );
}
