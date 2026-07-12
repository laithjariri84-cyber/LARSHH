"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { LARSSH_BRAND } from "@/lib/brand";
import { resolveSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = resolveSafeRedirectPath(
    searchParams.get("redirectTo"),
    "/dashboard"
  );

  const configError = searchParams.get("error");
  const setupHint =
    configError === "supabase_not_configured"
      ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the dev server."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Sync Prisma user/roles immediately so dashboard and CMS work on first load.
      await fetch("/auth/sync", { method: "POST", credentials: "include" });

      router.push(redirectTo as Route);
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Sign in failed";
      if (message.includes("NEXT_PUBLIC_SUPABASE")) {
        setError(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
        );
      } else if (message.toLowerCase().includes("failed to fetch")) {
        setError(
          "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and your network connection."
        );
      } else {
        setError(message);
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="larssh-card mx-auto flex w-full max-w-sm flex-col gap-8 rounded-2xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/50">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo size="lg" />
        <div>
          <p className="text-gold text-xs font-medium tracking-[0.22em] uppercase">
            {LARSSH_BRAND.name}
          </p>
          <h1 className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {LARSSH_BRAND.tagline}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="border-input bg-background/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="border-input bg-background/60"
          />
        </div>
        {setupHint ? (
          <p className="text-muted-foreground rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {setupHint}
          </p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" disabled={isLoading} className="larssh-gold-btn h-11 rounded-xl">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}
