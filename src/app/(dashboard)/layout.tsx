import { ParagonShell } from "@/components/layout/paragon-shell";
import { getShellUser } from "@/lib/auth";
import { isMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, showMiAdmin] = await Promise.all([
    getShellUser(),
    isMarketIntelligenceAdmin(),
  ]);

  return (
    <ParagonShell user={user} showMiAdmin={showMiAdmin}>
      {children}
    </ParagonShell>
  );
}