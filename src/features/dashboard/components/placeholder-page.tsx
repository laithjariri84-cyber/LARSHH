import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="paragon-card max-w-md rounded-2xl p-10 text-center">
        <div className="paragon-gold-gradient mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl shadow-lg shadow-gold/10">
          <Icon className="text-gold-foreground size-6" />
        </div>
        <p className="text-gold text-xs font-medium tracking-[0.2em] uppercase">
          LARSSH
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {description}
        </p>
        <div className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-xs">
          <Sparkles className="text-gold size-3.5" />
          Module preview · Database not connected
        </div>
      </div>
    </div>
  );
}
