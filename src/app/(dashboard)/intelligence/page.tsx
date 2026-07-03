import type { Metadata } from "next";

import { PropertyIntelligenceExperience } from "@/features/property-intelligence/components/property-intelligence-experience";

export const metadata: Metadata = {
  title: "Property Intelligence",
  description:
    "Bloomberg-grade property intelligence terminal for pricing, confidence, and advisory output.",
};

export default function IntelligencePage() {
  return <PropertyIntelligenceExperience />;
}
