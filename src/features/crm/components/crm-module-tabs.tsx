"use client";

import type { CrmModule } from "../types";
import { CRM_MODULES } from "../data/mock-crm-data";
import { cn } from "@/lib/utils";

type CrmModuleTabsProps = {
  active: CrmModule;
  onChange: (module: CrmModule) => void;
};

export function CrmModuleTabs({ active, onChange }: CrmModuleTabsProps) {
  return (
    <div className="paragon-card flex flex-wrap gap-1 rounded-2xl p-1.5">
      {CRM_MODULES.map((module) => (
        <button
          key={module.id}
          type="button"
          onClick={() => onChange(module.id)}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
            active === module.id
              ? "bg-gold-muted text-gold shadow-sm shadow-gold/5"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          {module.label}
        </button>
      ))}
    </div>
  );
}
