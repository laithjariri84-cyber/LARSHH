import { Logo } from "@/components/brand/logo";
import { LARSSH_BRAND } from "@/lib/brand";

export function LoadingBrand() {
  return (
    <div className="animate-fade-in flex items-center gap-3 pb-2">
      <Logo size="sm" />
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
          {LARSSH_BRAND.name}
        </p>
        <p className="text-muted-foreground text-xs">{LARSSH_BRAND.tagline}</p>
      </div>
    </div>
  );
}
