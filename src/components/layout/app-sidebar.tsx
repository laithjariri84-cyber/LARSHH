"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Property Search", href: "/search", icon: Search },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 border-r md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <Building2 className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">LARSSH</p>
          <p className="text-muted-foreground text-xs">Real Estate Platform</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="text-muted-foreground border-t p-4 text-xs">
        Property Search · Core Module
      </div>
    </aside>
  );
}
