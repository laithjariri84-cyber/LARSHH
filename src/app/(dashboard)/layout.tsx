import { ParagonShell } from "@/components/layout/paragon-shell";
import { perfAsync } from "@/lib/perf/timer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return perfAsync("Dashboard layout render", async () => {
    // Auth is enforced in middleware — skip duplicate Supabase getUser() per navigation.
    return <ParagonShell>{children}</ParagonShell>;
  });
}
