"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { getBreadcrumbs } from "@/lib/navigation/sidebar-nav";
import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  className?: string;
};

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-1 text-sm", className)}
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
              ) : null}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground flex max-w-[10rem] items-center gap-1 truncate transition-colors"
                >
                  {isFirst ? <Home className="size-3.5 shrink-0" /> : null}
                  <span className="truncate">{crumb.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "max-w-[12rem] truncate font-medium",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
