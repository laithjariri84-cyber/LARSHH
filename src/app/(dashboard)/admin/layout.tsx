import { ForbiddenPanel } from "@/components/auth/forbidden-panel";
import { getAuthContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAuthContext();

  if (!context || !hasPermission(context.appRole, "access.admin")) {
    return (
      <ForbiddenPanel message="Administration tools are restricted to Founder and Admin roles." />
    );
  }

  return children;
}
