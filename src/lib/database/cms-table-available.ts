import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

let cmsTableAvailable: boolean | null = null;

function isMissingCmsTableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") return true;
    if (error.code === "P2010") {
      const meta = error.meta as { code?: string; message?: string } | undefined;
      if (meta?.code === "42P01") return true;
      if (meta?.message?.includes("community_intelligence_cms")) return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("community_intelligence_cms") &&
      (message.includes("does not exist") || message.includes("42p01"))
    );
  }

  return false;
}

/** Cached check — safe to call from CMS loaders; never throws. */
export async function isCmsTableAvailable(): Promise<boolean> {
  if (cmsTableAvailable !== null) {
    return cmsTableAvailable;
  }

  try {
    await prisma.$queryRaw`SELECT 1 FROM community_intelligence_cms LIMIT 1`;
    cmsTableAvailable = true;
  } catch (error) {
    if (isMissingCmsTableError(error)) {
      cmsTableAvailable = false;
      console.warn(
        "[cms] community_intelligence_cms table is missing — CMS reads/writes are disabled until migrations are applied."
      );
    } else {
      console.error("[cms] CMS table availability check failed:", error);
      cmsTableAvailable = false;
    }
  }

  return cmsTableAvailable;
}

export function resetCmsTableAvailabilityCache(): void {
  cmsTableAvailable = null;
}

export { isMissingCmsTableError };
