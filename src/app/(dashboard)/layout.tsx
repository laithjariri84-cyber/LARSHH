import { ParagonShell } from "@/components/layout/paragon-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is enforced in middleware — skip duplicate Supabase getUser() per navigation.
  return <ParagonShell>{children}</ParagonShell>;
}
