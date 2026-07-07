"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

import { PageTransition } from "@/components/ui/page-transition";

import { Breadcrumbs } from "./breadcrumbs";
import { ParagonSidebar } from "./paragon-sidebar";
import { UserMenu } from "./user-menu";

type ParagonShellProps = {
  children: React.ReactNode;
};

export function ParagonShell({ children }: ParagonShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("paragon-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("paragon-sidebar-collapsed", String(next));
      return next;
    });
  }

  function closeMobileDrawer() {
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden lg:flex">
        <ParagonSidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-backdrop-in bg-black/50 backdrop-blur-sm dark:bg-black/60"
            onClick={closeMobileDrawer}
            aria-label="Close menu"
          />
          <div className="relative h-full w-64 animate-drawer-in shadow-2xl">
            <ParagonSidebar
              collapsed={false}
              isMobileDrawer
              onToggle={closeMobileDrawer}
              onNavigate={closeMobileDrawer}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-40 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border px-4 backdrop-blur-xl lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="text-muted-foreground hover:text-gold min-h-11 min-w-11 rounded-lg p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <Breadcrumbs className="hidden sm:flex" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="text-muted-foreground hover:text-gold relative min-h-11 min-w-11 rounded-lg p-2 transition-colors hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="bg-gold absolute top-1.5 right-1.5 size-1.5 rounded-full" />
            </button>
            <div className="border-border border-l pl-2 sm:pl-3">
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="border-border border-b px-4 py-2 sm:hidden">
          <Breadcrumbs />
        </div>

        <main className="flex-1 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
