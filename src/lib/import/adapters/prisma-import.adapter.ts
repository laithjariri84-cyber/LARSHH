import { ListingStatus, type Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

import { getDirectPrisma, prisma } from "@/lib/prisma";
import type { NormalizedImportRow } from "@/lib/import/core/types";

type TransactionClient = Prisma.TransactionClient;

/** Default Prisma interactive transaction timeout is 5000 ms — too low for CSV imports. */
const IMPORT_TRANSACTION_TIMEOUT_MS = 60_000;
const IMPORT_TRANSACTION_MAX_WAIT_MS = 10_000;
/** Rows per batch when importing large files (each batch is atomic). */
const IMPORT_BATCH_SIZE = 25;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const DEFAULT_ORG_ID = "00000000-0000-4000-8000-000000000001";

type ImportContext = {
  orgId: string;
  source: string;
  masterCache: Map<string, { id: string }>;
  communityCache: Map<string, { id: string; masterCommunityId: string }>;
  buildingCache: Map<string, { id: string }>;
  agentCache: Map<string, { id: string }>;
};

export class PrismaImportAdapter {
  async ensureOrganization() {
    return prisma.organization.upsert({
      where: { slug: "paragonos" },
      create: {
        id: DEFAULT_ORG_ID,
        name: "LARSSH",
        slug: "paragonos",
        defaultCurrency: "AED",
      },
      update: {},
    });
  }

  async findDuplicatePropertyCodes(codes: string[]) {
    if (codes.length === 0) return new Set<string>();
    const existing = await prisma.property.findMany({
      where: { propertyCode: { in: codes }, deletedAt: null },
      select: { propertyCode: true },
    });
    return new Set(existing.map((p) => p.propertyCode));
  }

  async findDuplicatePfExpertReferences(refs: string[]) {
    const filtered = refs.filter(Boolean);
    if (filtered.length === 0) return new Set<string>();
    const existing = await prisma.listing.findMany({
      where: { pfExpertReference: { in: filtered }, deletedAt: null },
      select: { pfExpertReference: true },
    });
    return new Set(
      existing
        .map((l) => l.pfExpertReference)
        .filter((ref): ref is string => Boolean(ref))
    );
  }

  async importRows(rows: NormalizedImportRow[], source: string) {
    const org = await this.ensureOrganization();
    const propertyIds: string[] = [];

    for (let offset = 0; offset < rows.length; offset += IMPORT_BATCH_SIZE) {
      const batch = rows.slice(offset, offset + IMPORT_BATCH_SIZE);
      const batchIds = await this.importBatch(org.id, batch, source);
      propertyIds.push(...batchIds);
    }

    return propertyIds;
  }

  private async importBatch(
    orgId: string,
    rows: NormalizedImportRow[],
    source: string
  ) {
    const ctx: ImportContext = {
      orgId,
      source,
      masterCache: new Map(),
      communityCache: new Map(),
      buildingCache: new Map(),
      agentCache: new Map(),
    };

    return getDirectPrisma().$transaction(
      async (tx) => {
        const propertyIds: string[] = [];

        for (const row of rows) {
          propertyIds.push(await this.importRow(tx, ctx, row));
        }

        return propertyIds;
      },
      {
        maxWait: IMPORT_TRANSACTION_MAX_WAIT_MS,
        timeout: IMPORT_TRANSACTION_TIMEOUT_MS,
      }
    );
  }

  private async importRow(
    tx: TransactionClient,
    ctx: ImportContext,
    row: NormalizedImportRow
  ) {
    const master = await this.ensureMasterCommunity(tx, ctx, row);
    const community = await this.ensureCommunity(tx, ctx, row, master.id);
    const building = await this.ensureBuilding(tx, ctx, community.id, row);
    const agent = await this.ensureAgent(tx, ctx, row.agentName);

    const property = await tx.property.create({
      data: {
        propertyCode: row.propertyCode,
        masterCommunityId: master.id,
        communityId: community.id,
        buildingId: building.id,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        areaSqft: row.areaSqft,
        propertyType: row.propertyType,
      },
    });

    const marketingTitle = `${row.location.community} — ${row.propertyType.replace(/_/g, " ")} — ${row.listingType}`;

    const listing = await tx.listing.create({
      data: {
        propertyId: property.id,
        agentId: agent.id,
        marketingTitle,
        askingPrice: row.askingPrice,
        currency: row.currency,
        listingType: row.listingType,
        status: row.listingStatus,
        qualityScore: row.qualityScore,
        pfExpertReference: row.pfExpertReference ?? row.propertyCode,
        publishedAt:
          row.listingStatus === ListingStatus.ACTIVE ? new Date() : null,
        pricePerSqft:
          row.areaSqft && row.areaSqft > 0
            ? row.askingPrice / row.areaSqft
            : null,
      },
    });

    await tx.priceHistory.create({
      data: {
        propertyId: property.id,
        listingId: listing.id,
        price: row.askingPrice,
        currency: row.currency,
        source: ctx.source,
        recordedAt: new Date(),
      },
    });

    return property.id;
  }

  private async ensureMasterCommunity(
    tx: TransactionClient,
    ctx: ImportContext,
    row: NormalizedImportRow
  ) {
    const masterSlug = slugify(
      `${row.location.emirate}-${row.location.masterCommunity}`
    );

    const cached = ctx.masterCache.get(masterSlug);
    if (cached) return cached;

    const master = await tx.masterCommunity.upsert({
      where: { slug: masterSlug },
      create: {
        organizationId: ctx.orgId,
        name: row.location.masterCommunity,
        slug: masterSlug,
        city: row.location.emirate,
        state: row.location.emirate,
        country: row.location.country,
      },
      update: { name: row.location.masterCommunity },
    });

    ctx.masterCache.set(masterSlug, master);
    return master;
  }

  private async ensureCommunity(
    tx: TransactionClient,
    ctx: ImportContext,
    row: NormalizedImportRow,
    masterCommunityId: string
  ) {
    const masterSlug = slugify(
      `${row.location.emirate}-${row.location.masterCommunity}`
    );
    const communitySlug = slugify(`${masterSlug}-${row.location.community}`);
    const cacheKey = `${masterCommunityId}:${communitySlug}`;

    const cached = ctx.communityCache.get(cacheKey);
    if (cached) return cached;

    const community = await tx.community.upsert({
      where: {
        masterCommunityId_slug: {
          masterCommunityId,
          slug: communitySlug,
        },
      },
      create: {
        masterCommunityId,
        name: row.location.community,
        slug: communitySlug,
        city: row.location.emirate,
        state: row.location.emirate,
        country: row.location.country,
      },
      update: { name: row.location.community },
    });

    ctx.communityCache.set(cacheKey, community);
    return community;
  }

  private async ensureBuilding(
    tx: TransactionClient,
    ctx: ImportContext,
    communityId: string,
    row: NormalizedImportRow
  ) {
    const cacheKey = `${communityId}:${row.location.building.toLowerCase()}`;
    const cached = ctx.buildingCache.get(cacheKey);
    if (cached) return cached;

    const existing = await tx.building.findFirst({
      where: { communityId, name: row.location.building },
    });

    const building =
      existing ??
      (await tx.building.create({
        data: {
          communityId,
          name: row.location.building,
          code: row.location.building.slice(0, 50),
          addressLine1: row.location.building,
          city: row.location.emirate,
          state: row.location.emirate,
          postalCode: "00000",
          country: row.location.country,
        },
      }));

    ctx.buildingCache.set(cacheKey, building);
    return building;
  }

  private async ensureAgent(
    tx: TransactionClient,
    ctx: ImportContext,
    agentName: string
  ) {
    const email = `import+${slugify(agentName)}@paragonos.local`;
    const cached = ctx.agentCache.get(email);
    if (cached) return cached;

    const existingUser = await tx.user.findUnique({
      where: { email },
      include: { agent: true },
    });

    if (existingUser?.agent) {
      ctx.agentCache.set(email, existingUser.agent);
      return existingUser.agent;
    }

    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          id: randomUUID(),
          organizationId: ctx.orgId,
          email,
          fullName: agentName,
          status: "ACTIVE",
        },
      }));

    await tx.userRoleAssignment.upsert({
      where: { userId_role: { userId: user.id, role: "AGENT" } },
      create: { userId: user.id, role: "AGENT" },
      update: {},
    });

    const agent = await tx.agent.upsert({
      where: { userId: user.id },
      create: { userId: user.id, agencyName: "LARSSH" },
      update: {},
    });

    ctx.agentCache.set(email, agent);
    return agent;
  }
}

export const prismaImportAdapter = new PrismaImportAdapter();
