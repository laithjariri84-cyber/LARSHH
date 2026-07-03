import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type WelcomeHeaderProps = {
  name: string;
};

export function WelcomeHeader({ name }: WelcomeHeaderProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
          LARSSH
        </p>
        <p className="text-muted-foreground mt-1 text-sm font-medium">{greeting}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Welcome back, {name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
          Your portfolio is performing strongly this quarter. Here is a snapshot
          of listings, market activity, and team performance.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search listings, communities, agents, or unit numbers..."
          className="h-11 border-white/10 bg-card/60 pl-10 backdrop-blur-sm transition-all focus-visible:border-gold/40 focus-visible:ring-gold/20"
        />
      </div>
    </div>
  );
}
