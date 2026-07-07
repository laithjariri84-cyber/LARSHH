/**
 * Temporary RSC diagnostics — logs server render failures to Vercel Function logs.
 * Remove once the production crash root cause is confirmed.
 */

import { perfLog } from "@/lib/perf/timer";

function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause:
        error.cause instanceof Error
          ? { name: error.cause.name, message: error.cause.message }
          : error.cause,
    };
  }

  return { value: String(error) };
}

export function logRscError(scope: string, error: unknown): never {
  console.error("=".repeat(72));
  console.error(`[RSC ERROR] scope=${scope}`);
  console.error("[RSC ERROR] detail:", JSON.stringify(formatError(error), null, 2));
  console.error("=".repeat(72));
  throw error;
}

export async function rscTry<T>(scope: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } catch (error) {
    logRscError(scope, error);
  } finally {
    perfLog(scope, performance.now() - start);
  }
}

export function rscTrySync<T>(scope: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } catch (error) {
    logRscError(scope, error);
  } finally {
    perfLog(scope, performance.now() - start);
  }
}
