/**
 * Property Domain — Aggregate Root
 *
 * Every LARSSH feature connects back to Property.
 * Import domain types from here — never compose aggregates in UI layers.
 */

export type {
  PropertyAggregate,
  PropertySummary,
} from "./aggregate";

export { isFullAggregate } from "./aggregate";

export type {
  PropertyIdentity,
  PropertyLocation,
  PropertyCommunity,
  PropertyBuilding,
  PropertyOwner,
  PropertySpecification,
  PropertyAgentAssignment,
} from "./core";

export type {
  PropertyListingRecord,
  PriceHistoryRecord,
  RentalHistoryRecord,
  SaleHistoryRecord,
} from "./listings-history";

export type {
  PropertyPhoto,
  PropertyVideo,
  PropertyFloorPlan,
  PropertyMediaBundle,
  PropertyAmenity,
  PropertyMaintenanceRecord,
  PropertyDocument,
} from "./media-assets";

export type {
  PropertyViewingRecord,
  PropertyOfferRecord,
  PropertyTaskRecord,
  PropertyNoteRecord,
  PropertyWorkflowBundle,
} from "./workflow";

export type {
  PropertyMarketStatistics,
  ComparablePropertyRecord,
  PropertyROI,
  HolidayHomeData,
  PropertyMarketBundle,
} from "./market";

export type {
  PropertyAggregateSection,
  PropertyLoadOptions,
  PropertyLoadProfile,
} from "./sections";

export {
  PROPERTY_AGGREGATE_SECTIONS,
  PROPERTY_LOAD_PROFILES,
  resolveLoadSections,
} from "./sections";

export type {
  CreatePropertyAggregateInput,
  UpdatePropertyCoreInput,
  AppendPropertyChildInput,
  PropertyAggregatePatch,
} from "./inputs";
