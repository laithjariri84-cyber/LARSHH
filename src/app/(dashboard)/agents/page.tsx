import type { Metadata } from "next";

import { Users } from "lucide-react";



import { ForbiddenPanel } from "@/components/auth/forbidden-panel";

import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

import { hasPermission } from "@/lib/auth/permissions";

import { getAuthContext } from "@/lib/auth/session";



export const metadata: Metadata = { title: "Agents" };



export default async function AgentsPage() {

  const context = await getAuthContext();

  if (!context || !hasPermission(context.appRole, "access.users")) {

    return (

      <ForbiddenPanel message="User and agent management is restricted to Founder and Admin roles." />

    );

  }



  return (

    <PlaceholderPage

      title="Agents"

      description="Oversee licensed professionals, assignments, performance metrics, and client relationships."

      icon={Users}

    />

  );

}

