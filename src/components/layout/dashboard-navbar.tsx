import { UserNav } from "@/components/layout/user-nav";

type DashboardNavbarProps = {
  title: string;
  description?: string;
  user: { email: string; fullName?: string | null };
  count?: number;
};

export function DashboardNavbar({
  title,
  description,
  user,
  count,
}: DashboardNavbarProps) {
  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur md:px-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {count !== undefined ? (
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
              {count} {count === 1 ? "property" : "properties"}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      <UserNav email={user.email} fullName={user.fullName} />
    </header>
  );
}
