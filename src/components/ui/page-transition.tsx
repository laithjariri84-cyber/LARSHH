"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-page-enter", className)}>
      {children}
    </div>
  );
}
