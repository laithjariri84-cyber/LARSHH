import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { PropertyDetailsView } from "@/features/properties/components/property-details-view";
import { getPropertyDetailsById } from "@/features/properties/services/property-details";
import { logRscError, rscTry } from "@/lib/rsc-debug";
import { perfAsync } from "@/lib/perf/timer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const property = await rscTry(
      "properties/[id]/generateMetadata:getPropertyDetailsById",
      () => getPropertyDetailsById(id)
    );

    if (!property) return { title: "Property Not Found" };

    const title = property.unitNumber
      ? `Unit ${property.unitNumber} · ${property.building}`
      : property.building;

    return { title };
  } catch (error) {
    logRscError("properties/[id]/generateMetadata", error);
  }
}

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  return perfAsync("Property Details render", async () => {
    try {
      const { id } = await params;
      const property = await rscTry("getPropertyDetailsById", () =>
        getPropertyDetailsById(id)
      );

      if (!property) notFound();

      return <PropertyDetailsView property={property} />;
    } catch (error) {
      logRscError("properties/[id]/page:render", error);
    }
  });
}
