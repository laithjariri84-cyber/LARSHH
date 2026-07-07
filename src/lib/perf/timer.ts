/**
 * Server-side performance timing — logs [PERF] label: Xms to the console.
 * Enabled when PERF_LOG=1 or NODE_ENV=development.
 */

export function isPerfLogEnabled(): boolean {
  return (
    process.env.PERF_LOG === "1" ||
    process.env.PERF_LOG === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function perfLog(label: string, durationMs: number): void {
  if (!isPerfLogEnabled()) return;
  console.log(`[PERF] ${label}: ${Math.round(durationMs)}ms`);
}

export async function perfAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isPerfLogEnabled()) return fn();

  const start = performance.now();
  try {
    return await fn();
  } finally {
    perfLog(label, performance.now() - start);
  }
}

export function perfSync<T>(label: string, fn: () => T): T {
  if (!isPerfLogEnabled()) return fn();

  const start = performance.now();
  try {
    return fn();
  } finally {
    perfLog(label, performance.now() - start);
  }
}
