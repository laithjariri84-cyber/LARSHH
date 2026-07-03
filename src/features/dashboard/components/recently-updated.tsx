import { Clock3 } from "lucide-react";

import type { UpdatedListing } from "../data/mock-dashboard";

type RecentlyUpdatedProps = {
  items: UpdatedListing[];
};

export function RecentlyUpdated({ items }: RecentlyUpdatedProps) {
  return (
    <div className="paragon-card rounded-2xl p-5">
      <h3 className="mb-4 font-semibold tracking-tight">Recently Updated</h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0"
          >
            <div className="bg-gold-muted text-gold mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Clock3 className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium transition-colors group-hover:text-gold">
                {item.title}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {item.change}
              </p>
              <p className="text-muted-foreground/70 mt-1 text-[11px]">
                {item.updatedAt}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
