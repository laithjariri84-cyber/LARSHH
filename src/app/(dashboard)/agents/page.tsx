import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export const metadata: Metadata = { title: "Agents" };

export default function AgentsPage() {
  return (
    <PlaceholderPage
      title="Agents"
      description="Oversee licensed professionals, assignments, performance metrics, and client relationships."
      icon={Users}
    />
  );
}
