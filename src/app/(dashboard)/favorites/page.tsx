import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return (
    <PlaceholderPage
      title="Favorites"
      description="Your saved listings, watched communities, and priority properties in one curated view."
      icon={Heart}
    />
  );
}
