import { redirect } from "next/navigation";

import { ParagonShell } from "@/components/layout/paragon-shell";
import { getUser } from "@/lib/auth";
import { isUiOnlyMode } from "@/lib/ui-only";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isUiOnlyMode()) {
    const user = await getUser();
    if (!user) redirect("/login");
  }

  return <ParagonShell>{children}</ParagonShell>;
}
