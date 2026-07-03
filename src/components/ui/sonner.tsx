"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "larssh-glass group rounded-2xl border border-white/10 bg-black/80 text-foreground shadow-2xl shadow-black/50 backdrop-blur-xl",
          title: "text-sm font-semibold text-white",
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
