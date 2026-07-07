import { cn } from "@/lib/utils";
import { LARSSH_BRAND } from "@/lib/brand";

type LogoProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
};

const boxSizes = {
  xs: "size-7 rounded-lg",
  sm: "size-9 rounded-xl",
  md: "size-12 rounded-xl",
  lg: "size-14 rounded-2xl",
  xl: "size-20 rounded-2xl",
} as const;

const iconSizes = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 28,
  xl: 40,
} as const;

function LogoMark({ size = "sm" }: { size?: LogoProps["size"] }) {
  const px = iconSizes[size ?? "sm"];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0a0a0b" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        stroke={LARSSH_BRAND.gold}
        strokeOpacity="0.35"
      />
      <path
        d="M10 8h4.5l7.5 16H17l-1.4-3.2H12.2L10.8 24H7.5L10 8Zm4.1 9.2L12.6 13l-1.5 4.2h3Z"
        fill={LARSSH_BRAND.gold}
      />
    </svg>
  );
}

export function Logo({ size = "sm", showWordmark = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "larssh-glass flex shrink-0 items-center justify-center shadow-lg shadow-black/40",
          boxSizes[size]
        )}
      >
        <LogoMark size={size} />
      </div>
      {showWordmark ? (
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold tracking-[0.14em] uppercase">
            {LARSSH_BRAND.name}
          </p>
          <p className="text-muted-foreground truncate text-[11px]">
            {LARSSH_BRAND.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use Logo from @/components/brand/logo */
export function LarsshLogo({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mapped = size === "lg" ? "lg" : size === "md" ? "md" : "sm";
  return <Logo size={mapped} className={className} />;
}
