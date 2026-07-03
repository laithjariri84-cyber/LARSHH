/**
 * Property Aggregate Root
 *
 * The Property is the single canonical object of LARSSH. Every module —
 * Search, Intelligence, CRM, Reports — resolves to a Property aggregate or a
 * paginated list of PropertySummary projections derived from it.
 *
 * Invariants (enforced by domain service, not UI):
 * - identity.id is immutable
 * - currentListing, if present, belongs to this property
 * - all child collections reference this property's identity.id
 * - owner and agent assignments are consistent with listing records
 */

import type {
  PropertyAgentAssignment,
  PropertyBuilding,
  PropertyCommunity,
  PropertyIdentity,
  PropertyLocation,
  PropertyOwner,
  PropertySpecification,
} from "./core";
import type {
  PriceHistoryRecord,
  PropertyListingRecord,
  RentalHistoryRecord,
  SaleHistoryRecord,
} from "./listings-history";
import type {
  PropertyAmenity,
  PropertyDocument,
  PropertyMaintenanceRecord,
  PropertyMediaBundle,
} from "./media-assets";
import type { PropertyMarketBundle } from "./market";
import type { PropertyAggregateSection } from "./sections";
import type { PropertyWorkflowBundle } from "./workflow";

export type PropertyAggregate = {
  /** Identity & placement — always loaded */
  identity: PropertyIdentity;
  location: PropertyLocation;

  /** Hierarchy projections */
  community: PropertyCommunity | null;
  building: PropertyBuilding | null;

  /** People */
  owner: PropertyOwner | null;
  agentAssignment: PropertyAgentAssignment | null;

  /** Product */
  specification: PropertySpecification;

  /** Market */
  currentListing: PropertyListingRecord | null;
  previousListings: PropertyListingRecord[];

  /** Financial history */
  priceHistory: PriceHistoryRecord[];
  rentalHistory: RentalHistoryRecord[];
  saleHistory: SaleHistoryRecord[];

  /** Assets */
  media: PropertyMediaBundle;
  amenities: PropertyAmenity[];
  maintenance: PropertyMaintenanceRecord[];
  documents: PropertyDocument[];

  /** Operational workflow */
  workflow: PropertyWorkflowBundle;

  /** Intelligence */
  market: PropertyMarketBundle;

  /** Aggregate metadata */
  version: number;
  loadedSections: PropertyAggregateSection[];
};

/** Lightweight projection for search, dashboards, and list endpoints. */
export type PropertySummary = {
  identity: PropertyIdentity;
  location: PropertyLocation;
  community: PropertyCommunity | null;
  building: PropertyBuilding | null;
  specification: PropertySpecification;
  currentListing: PropertyListingRecord | null;
  agentAssignment: PropertyAgentAssignment | null;
  market: Pick<
    PropertyMarketBundle,
    "statistics" | "roi"
  >;
};

export function isFullAggregate(
  aggregate: PropertyAggregate
): boolean {
  return aggregate.loadedSections.length >= 20;
}
