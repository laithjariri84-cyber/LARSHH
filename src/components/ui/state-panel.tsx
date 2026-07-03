import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "larssh-card flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center",
        className
      )}
    >
      <div className="bg-gold-muted text-gold mb-5 flex size-14 items-center justify-center rounded-2xl">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {action ? (
        action.href ? (
          <Button asChild className="larssh-gold-btn mt-6">
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : (
          <Button className="larssh-gold-btn mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "larssh-card flex flex-col items-center justify-center rounded-2xl border border-destructive/20 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {onRetry ? (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
