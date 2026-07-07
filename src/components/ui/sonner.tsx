"use client";

import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/components/layout/theme-provider";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "larssh-glass group rounded-2xl border border-border bg-card/90 text-foreground shadow-2xl backdrop-blur-xl",
          title: "text-foreground text-sm font-semibold",
          description: "text-muted-foreground text-xs",
          success: "border-emerald-500/20",
          error: "border-destructive/30",
          info: "border-gold/20",
        },
      }}
      closeButton
    />
  );
}
