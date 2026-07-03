import type { Metadata } from "next";

import { CommunitiesExperience } from "@/features/communities/components/communities-experience";

export const metadata: Metadata = { title: "Communities" };

export default function CommunitiesPage() {
  return <CommunitiesExperience />;
}
