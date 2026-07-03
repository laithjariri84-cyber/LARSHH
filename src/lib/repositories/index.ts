/**
 * Legacy Prisma repositories.
 *
 * Phase 2 note: New repository **interfaces** live in `src/repositories/`.
 * This folder retains the concrete property implementation used by
 * `/search` and `/properties/[id]` until Phase 3 migration.
 *
 * @see docs/PHASE-2-ARCHITECTURE.md
 */

export {
  getAllProperties,
  getPropertyById,
  getSimilarProperties,
  searchProperties,
  getCommunityOptions,
  getBuildingOptions,
  propertySearchInclude,
  propertyDetailsInclude,
  similarPropertyInclude,
} from "./property.repository";

export type {
  PropertySearchRecord,
  PropertyDetailsRecord,
  SimilarPropertyRecord,
} from "./property.repository";
