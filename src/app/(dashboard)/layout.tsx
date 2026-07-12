import { ParagonShell } from "@/components/layout/paragon-shell";
import { getShellUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getShellUser();

  return <ParagonShell user={user}>{children}</ParagonShell>;
}
