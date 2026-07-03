import type { Metadata } from "next";

import { CrmExperience } from "@/features/crm/components/crm-experience";

export const metadata: Metadata = {
  title: "CRM",
  description:
    "Enterprise CRM pipeline for leads, viewings, tasks, and deals.",
};

export default function CrmPage() {
  return <CrmExperience />;
}
