"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[RSC ERROR] scope=dashboard/error-boundary", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="larssh-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="larssh-card max-w-lg rounded-2xl p-8">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="size-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          A server error occurred while loading this page. You can retry or return
          to search.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground mt-3 font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="larssh-gold-btn">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">Go to Search</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
