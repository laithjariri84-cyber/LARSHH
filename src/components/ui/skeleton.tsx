import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("larssh-skeleton bg-muted/50 rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
