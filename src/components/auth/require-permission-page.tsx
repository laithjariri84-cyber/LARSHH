import { ForbiddenPanel } from "@/components/auth/forbidden-panel";
import { hasPermission } from "@/lib/auth/permissions";
import { getAuthContext } from "@/lib/auth/session";
import type { Permission } from "@/lib/auth/permissions";

type RequirePermissionPageProps = {
  permission: Permission;
  children: React.ReactNode;
  message?: string;
};

export async function RequirePermissionPage({
  permission,
  children,
  message,
}: RequirePermissionPageProps) {
  const context = await getAuthContext();

  if (!context || !hasPermission(context.appRole, permission)) {
    return <ForbiddenPanel message={message} />;
  }

  return children;
}
