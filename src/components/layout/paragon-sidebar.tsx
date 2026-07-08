"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Search,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import { LARSSH_BRAND } from "@/lib/brand";
import {
  filterSidebarNavGroups,
  isNavItemActive,
  type SidebarNavGroup,
  type SidebarNavItem,
} from "@/lib/navigation/sidebar-nav";
import { cn } from "@/lib/utils";

const GROUPS_STORAGE_KEY = "paragon-sidebar-groups-expanded";
const DEFAULT_EXPANDED: Record<string, boolean> = {
  home: true,
  properties: true,
  crm: true,
  analytics: false,
  admin: false,
  administration: false,
};

type ParagonSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
  showMiAdmin?: boolean;
};

function readExpandedGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return DEFAULT_EXPANDED;
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return DEFAULT_EXPANDED;
    return { ...DEFAULT_EXPANDED, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EXPANDED;
  }
}

function filterGroups(query: string, showMiAdmin: boolean): SidebarNavGroup[] {
  const groups = filterSidebarNavGroups(showMiAdmin);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalized) ||
          item.keywords?.some((keyword) => keyword.includes(normalized)) ||
          group.title.toLowerCase().includes(normalized)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function NavLink({
  item,
  collapsed,
  isMobileDrawer,
  isActive,
  onNavigate,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
  isMobileDrawer: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
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
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        item.featured && !isActive ? "border border-gold/10" : undefined
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-gold" : "group-hover:text-gold/80"
        )}
      />
      {!collapsed ? <span className="truncate animate-fade-in">{item.title}</span> : null}
    </Link>
  );
}

export function ParagonSidebar({
  collapsed,
  onToggle,
  onNavigate,
  isMobileDrawer = false,
  showMiAdmin = false,
}: ParagonSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    DEFAULT_EXPANDED
  );

  useEffect(() => {
    setExpandedGroups(readExpandedGroups());
  }, []);

  const filteredGroups = useMemo(
    () => filterGroups(searchQuery, showMiAdmin),
    [searchQuery, showMiAdmin]
  );

  const flatItems = useMemo(
    () => filterSidebarNavGroups(showMiAdmin).flatMap((group) => group.items),
    [showMiAdmin]
  );

  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const showGroupedNav = !collapsed || isMobileDrawer;

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border relative flex h-svh shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out",
        collapsed && !isMobileDrawer ? "w-[72px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          collapsed && !isMobileDrawer ? "justify-center px-2" : "gap-3 px-4"
        )}
      >
        <Logo size="sm" />
        {showGroupedNav ? (
          <div className="min-w-0 animate-fade-in">
            <p className="text-sidebar-foreground truncate text-sm font-semibold tracking-[0.12em] uppercase">
              {LARSSH_BRAND.name}
            </p>
            <p className="text-muted-foreground truncate text-[11px]">
              {LARSSH_BRAND.shortTagline}
            </p>
          </div>
        ) : null}
      </div>

      {showGroupedNav ? (
        <div className="border-sidebar-border border-b p-3">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find a page…"
              className="border-sidebar-border bg-background/50 h-10 rounded-xl pl-9 text-sm"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {showGroupedNav
          ? filteredGroups.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = searchQuery
                ? true
                : (expandedGroups[group.id] ?? true);
              const hasActiveItem = group.items.some((item) =>
                isNavItemActive(pathname, item.href)
              );

              return (
                <div key={group.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "flex w-full min-h-10 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold tracking-wide uppercase transition-colors",
                      hasActiveItem
                        ? "text-gold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <GroupIcon className="size-3.5 shrink-0" />
                    <span className="flex-1 truncate">{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 transition-transform duration-200",
                        isExpanded ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </button>

                  {isExpanded ? (
                    <div className="mt-0.5 flex flex-col gap-0.5 pl-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          collapsed={false}
                          isMobileDrawer={isMobileDrawer}
                          isActive={isNavItemActive(pathname, item.href)}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          : flatItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed
                isMobileDrawer={false}
                isActive={isNavItemActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "text-muted-foreground hover:text-gold flex min-h-11 w-full items-center rounded-xl border border-transparent py-2 text-sm transition-colors hover:border-sidebar-border hover:bg-accent",
            collapsed && !isMobileDrawer ? "justify-center px-0" : "gap-3 px-3"
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
              <span>Close</span>
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
