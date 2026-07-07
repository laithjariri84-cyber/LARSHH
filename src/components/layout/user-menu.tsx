"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

import { mockUser } from "@/features/dashboard/data/mock-dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { ThemeSelector } from "./theme-selector";

type UserMenuProps = {
  className?: string;
};

export function UserMenu({ className }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "hover:bg-accent flex items-center gap-3 rounded-lg border border-transparent px-1 py-1 transition-colors outline-none focus-visible:border-gold/40",
            className
          )}
          aria-label="Open user menu"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{mockUser.name}</p>
            <p className="text-muted-foreground text-xs">{mockUser.role}</p>
          </div>
          <div
            className={cn(
              "paragon-gold-gradient flex size-9 items-center justify-center rounded-full text-xs font-semibold",
              "text-gold-foreground shadow-md shadow-gold/20"
            )}
          >
            {mockUser.initials}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{mockUser.name}</p>
          <p className="text-muted-foreground text-xs">{mockUser.role}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeSelector />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex cursor-pointer items-center gap-2">
            <Settings className="text-muted-foreground size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/auth/signout" className="flex cursor-pointer items-center gap-2">
            <LogOut className="text-muted-foreground size-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
