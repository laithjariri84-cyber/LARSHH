import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { PropertyDetailsView } from "@/features/properties/components/property-details-view";
import { getPropertyDetailsById } from "@/features/properties/services/property-details";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyDetailsById(id);

  if (!property) return { title: "Property Not Found" };

  const title = property.unitNumber
    ? `Unit ${property.unitNumber} · ${property.building}`
    : property.building;

  return { title };
}

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;
  const property = await getPropertyDetailsById(id);

  if (!property) notFound();

  return <PropertyDetailsView property={property} />;
}
