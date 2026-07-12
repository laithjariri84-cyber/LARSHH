/**
 * Runtime environment validation for database and Supabase connectivity.
 * Does not log secret values.
 */

const PLACEHOLDER_PATTERNS = [
  "placeholder",
  "your-project-ref",
  "your-supabase",
  "paste_",
  "paste-",
  "[password]",
  "[YOUR-PASSWORD]",
  "[project-ref]",
];

export type EnvIssue = {
  key: string;
  message: string;
  severity: "error" | "warning";
};

export type EnvDiagnostics = {
  ok: boolean;
  issues: EnvIssue[];
  databaseHost: string | null;
  supabaseHost: string | null;
  uiOnlyMode: boolean;
};

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => lower.includes(pattern));
}

function safeHostFromUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function parseDatabaseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function diagnoseEnvironment(
  env: NodeJS.ProcessEnv = process.env
): EnvDiagnostics {
  const issues: EnvIssue[] = [];

  const uiOnlyMode = env.NEXT_PUBLIC_UI_ONLY === "true";
  const databaseUrl = env.DATABASE_URL?.trim();
  const directUrl = env.DIRECT_URL?.trim();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (uiOnlyMode) {
    issues.push({
      key: "NEXT_PUBLIC_UI_ONLY",
      message:
        "UI-only mode is enabled. Set NEXT_PUBLIC_UI_ONLY=false for real auth and database.",
      severity: "error",
    });
  }

  if (!databaseUrl) {
    issues.push({
      key: "DATABASE_URL",
      message: "DATABASE_URL is not set.",
      severity: "error",
    });
  } else {
    const parsed = parseDatabaseUrl(databaseUrl);
    if (!parsed) {
      issues.push({
        key: "DATABASE_URL",
        message: "DATABASE_URL is not a valid URL.",
        severity: "error",
      });
    } else {
      if (parsed.port === "5432" && !parsed.searchParams.has("pgbouncer")) {
        // Session pooler on 5432 is valid for IPv4/local Supabase connections.
      } else if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
        issues.push({
          key: "DATABASE_URL",
          message: "DATABASE_URL on port 6543 should include ?pgbouncer=true.",
          severity: "warning",
        });
      }
    }
  }

  if (!directUrl) {
    issues.push({
      key: "DIRECT_URL",
      message: "DIRECT_URL is not set (required for Prisma migrations).",
      severity: "warning",
    });
  } else if (databaseUrl && directUrl === databaseUrl) {
    const parsed = parseDatabaseUrl(databaseUrl);
    const sameSessionPooler =
      parsed?.port === "5432" && !parsed.searchParams.has("pgbouncer");
    if (!sameSessionPooler) {
      issues.push({
        key: "DIRECT_URL",
        message:
          "DIRECT_URL should use session pooler port 5432; DATABASE_URL should use transaction pooler port 6543.",
        severity: "warning",
      });
    }
  }

  if (isPlaceholder(supabaseUrl)) {
    issues.push({
      key: "NEXT_PUBLIC_SUPABASE_URL",
      message:
        "Supabase URL is missing or still a placeholder. Use https://vuwghcgmoyncvrlwpalj.supabase.co",
      severity: "error",
    });
  }

  if (isPlaceholder(supabaseAnonKey)) {
    issues.push({
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      message:
        "Supabase anon key is missing or still a placeholder. Copy it from Supabase → Project Settings → API.",
      severity: "error",
    });
  }

  const errors = issues.filter((issue) => issue.severity === "error");

  return {
    ok: errors.length === 0,
    issues,
    databaseHost: safeHostFromUrl(databaseUrl),
    supabaseHost: safeHostFromUrl(supabaseUrl),
    uiOnlyMode,
  };
}

export function isSupabaseConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key && !isPlaceholder(url) && !isPlaceholder(key));
}

export function getSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env
): { url: string; anonKey: string } {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || isPlaceholder(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured. Set it in .env.local (Project Settings → API)."
    );
  }

  if (!anonKey || isPlaceholder(anonKey)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Set it in .env.local (Project Settings → API)."
    );
  }

  return { url, anonKey };
}

export function formatEnvIssues(issues: EnvIssue[]): string {
  return issues
    .map((issue) => `${issue.severity.toUpperCase()} ${issue.key}: ${issue.message}`)
    .join("\n");
}
