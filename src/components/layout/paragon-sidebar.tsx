"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  Heart,
  LayoutDashboard,
  LineChart,
  Radar,
  Search,
  Settings,
  Upload,
  Users,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LARSSH_BRAND } from "@/lib/brand";

import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Property Intelligence",
    href: "/intelligence",
    icon: Radar,
    featured: true,
  },
  { title: "Market Intelligence", href: "/market", icon: LineChart },
  { title: "CRM", href: "/crm", icon: Briefcase },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Search Listings", href: "/search", icon: Search },
  { title: "Import Listings", href: "/import", icon: Upload },
  { title: "Communities", href: "/communities", icon: Building2 },
  { title: "Agents", href: "/agents", icon: Users },
  { title: "Favorites", href: "/favorites", icon: Heart },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

type ParagonSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
};

export function ParagonSidebar({
  collapsed,
  onToggle,
  onNavigate,
  isMobileDrawer = false,
}: ParagonSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border relative flex h-svh shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/5",
          collapsed ? "justify-center px-2" : "gap-3 px-4"
        )}
      >
        <Logo size="sm" />
        {!collapsed ? (
          <div className="min-w-0 animate-fade-in">
            <p className="truncate text-sm font-semibold tracking-[0.12em] text-white uppercase">
              {LARSSH_BRAND.name}
            </p>
            <p className="text-muted-foreground truncate text-[11px]">
              {LARSSH_BRAND.shortTagline}
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/market" &&
              item.href !== "/crm" &&
              item.href !== "/intelligence" &&
              pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/market" && pathname.startsWith("/market")) ||
            (item.href === "/crm" && pathname.startsWith("/crm")) ||
            (item.href === "/intelligence" && pathname.startsWith("/intelligence"));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              onClick={() => onNavigate?.()}
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                isMobileDrawer
                  ? "min-h-11 gap-3 px-3 py-2.5"
                  : collapsed
                    ? "justify-center px-0 py-2.5"
                    : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-gold-muted text-gold shadow-sm shadow-gold/5"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                "featured" in item && item.featured && !isActive
                  ? "border border-gold/10"
                  : undefined
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-gold" : "group-hover:text-gold/80"
                )}
              />
              {!collapsed ? (
                <span className="truncate animate-fade-in">{item.title}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "text-muted-foreground hover:text-gold flex min-h-11 w-full items-center rounded-xl border border-transparent py-2 text-sm transition-colors hover:border-white/5 hover:bg-white/5",
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
          aria-label={
            isMobileDrawer
              ? "Close menu"
              : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
        >
          {isMobileDrawer ? (
            <>
              <X className="size-4" />
              {!collapsed ? <span>Close</span> : null}
            </>
          ) : (
            <>
              <ChevronLeft
                className={cn(
                  "size-4 transition-transform duration-300",
                  collapsed && "rotate-180"
                )}
              />
              {!collapsed ? <span>Collapse</span> : null}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
