import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Building2,
  Heart,
  Home,
  LayoutDashboard,
  LineChart,
  Radar,
  Search,
  Settings,
  Shield,
  Upload,
  Users,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  featured?: boolean;
  keywords?: string[];
};

export type SidebarNavGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SidebarNavItem[];
};

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        keywords: ["overview", "stats"],
      },
      {
        title: "Property Intelligence",
        href: "/intelligence",
        icon: Radar,
        featured: true,
        keywords: ["ai", "terminal", "analysis"],
      },
      {
        title: "Favorites",
        href: "/favorites",
        icon: Heart,
        keywords: ["saved", "bookmarks"],
      },
    ],
  },
  {
    id: "properties",
    title: "Properties",
    icon: Building2,
    items: [
      {
        title: "Search Listings",
        href: "/search",
        icon: Search,
        keywords: ["listings", "find", "filter"],
      },
      {
        title: "Import Listings",
        href: "/import",
        icon: Upload,
        keywords: ["upload", "csv", "pf expert"],
      },
      {
        title: "Communities",
        href: "/communities",
        icon: Building2,
        keywords: ["projects", "developments"],
      },
    ],
  },
  {
    id: "crm",
    title: "CRM",
    icon: Briefcase,
    items: [
      {
        title: "CRM",
        href: "/crm",
        icon: Briefcase,
        keywords: ["leads", "deals", "tasks", "viewings"],
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    items: [
      {
        title: "Market Intelligence",
        href: "/market",
        icon: LineChart,
        keywords: ["pricing", "benchmarks", "roi"],
      },
      {
        title: "Market Analysis",
        href: "/market-analysis",
        icon: BarChart3,
        keywords: ["reports", "trends"],
      },
    ],
  },
  {
    id: "administration",
    title: "Administration",
    icon: Shield,
    items: [
      {
        title: "Agents",
        href: "/agents",
        icon: Users,
        keywords: ["team", "brokers"],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        keywords: ["preferences", "account"],
      },
      {
        title: "Market Intelligence Admin",
        href: "/settings/market-intelligence",
        icon: Shield,
        keywords: ["admin", "benchmarks", "data"],
      },
    ],
  },
];

export const allSidebarNavItems = sidebarNavGroups.flatMap((group) => group.items);

const exactMatchRoutes = new Set([
  "/dashboard",
  "/market",
  "/crm",
  "/intelligence",
  "/market-analysis",
  "/settings/market-intelligence",
]);

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;

  if (exactMatchRoutes.has(href)) {
    return pathname.startsWith(`${href}/`);
  }

  if (href === "/settings") {
    return pathname.startsWith("/settings/") && !pathname.startsWith("/settings/market-intelligence");
  }

  return pathname.startsWith(`${href}/`);
}

export function findNavItemByPath(pathname: string): SidebarNavItem | undefined {
  return allSidebarNavItems.find((item) => isNavItemActive(pathname, item.href));
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/dashboard" }];

  if (pathname === "/dashboard") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }

  const matchedItem = findNavItemByPath(pathname);
  if (matchedItem && pathname === matchedItem.href) {
    const group = sidebarNavGroups.find((g) =>
      g.items.some((item) => item.href === matchedItem.href)
    );
    if (group && group.id !== "home") {
      crumbs.push({ label: group.title });
    }
    crumbs.push({ label: matchedItem.title });
    return crumbs;
  }

  if (pathname.startsWith("/properties/")) {
    crumbs.push({ label: "Properties" });
    crumbs.push({ label: "Search Listings", href: "/search" });
    crumbs.push({ label: "Property Details" });
    return crumbs;
  }

  if (pathname.startsWith("/communities/") && pathname !== "/communities") {
    crumbs.push({ label: "Properties" });
    crumbs.push({ label: "Communities", href: "/communities" });
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 3) {
      crumbs.push({ label: formatSegmentLabel(segments[2]) });
    } else {
      crumbs.push({ label: "Community" });
    }
    return crumbs;
  }

  if (matchedItem) {
    const group = sidebarNavGroups.find((g) =>
      g.items.some((item) => item.href === matchedItem.href)
    );
    if (group) crumbs.push({ label: group.title, href: matchedItem.href });
    crumbs.push({ label: matchedItem.title });
    return crumbs;
  }

  const segments = pathname.split("/").filter(Boolean);
  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    crumbs.push({
      label: formatSegmentLabel(segment),
      href: isLast ? undefined : href,
    });
  });

  return crumbs;
}
