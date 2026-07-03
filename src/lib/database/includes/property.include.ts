import type { Prisma } from "@prisma/client";

import type { PropertyAggregateSection } from "@/domain/property";
import { resolveLoadSections } from "@/domain/property";
import type { PropertyLoadOptions } from "@/domain/property";

/** Prisma include graph for property aggregate hydration by section. */
export function buildPropertyInclude(
  options?: PropertyLoadOptions
): Prisma.PropertyInclude {
  const sections = new Set(resolveLoadSections(options));

  const include: Prisma.PropertyInclude = {
    masterCommunity: true,
    community: true,
    building: {
      include: {
        community: true,
      },
    },
  };

  if (sections.has("owner")) {
    include.owner = true;
  }

  if (
    sections.has("current_listing") ||
    sections.has("previous_listings") ||
    sections.has("agent_assignment")
  ) {
    include.listings = {
      where: { deletedAt: null },
      include: {
        agent: sections.has("agent_assignment")
          ? { include: { user: true } }
          : true,
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    };
  }

  if (sections.has("price_history")) {
    include.priceHistory = {
      orderBy: { recordedAt: "desc" },
      take: options?.collectionLimits?.price_history ?? 100,
    };
  }

  if (sections.has("offers")) {
    include.offers = {
      orderBy: { submittedAt: "desc" },
      take: options?.collectionLimits?.offers ?? 50,
    };
  }

  if (sections.has("viewings")) {
    include.viewings = {
      orderBy: { scheduledAt: "desc" },
      take: options?.collectionLimits?.viewings ?? 50,
    };
  }

  if (sections.has("tasks")) {
    include.tasks = {
      orderBy: { dueAt: "asc" },
      take: options?.collectionLimits?.tasks ?? 100,
    };
  }

  if (sections.has("market_statistics") || sections.has("roi")) {
    include.marketStatistics = {
      where: { scopeType: "PROPERTY" },
      orderBy: { periodStart: "desc" },
      take: 1,
    };
  }

  if (sections.has("comparables")) {
    include.subjectComparables = {
      orderBy: { similarityScore: "desc" },
      take: options?.collectionLimits?.comparables ?? 20,
      include: {
        compProperty: {
          include: {
            building: { include: { community: true } },
            listings: {
              where: { deletedAt: null, status: { in: ["ACTIVE", "PENDING"] } },
              take: 1,
              orderBy: { updatedAt: "desc" },
            },
          },
        },
        compListing: true,
      },
    };
  }

  return include;
}

export const ACTIVE_LISTING_STATUSES = ["ACTIVE", "PENDING"] as const;

export function sectionLoaded(
  loaded: PropertyAggregateSection[],
  section: PropertyAggregateSection
): boolean {
  return loaded.includes(section);
}
