# LARSSH — Property Domain Model

**Version:** 2.0  
**Pattern:** Domain-Driven Design — Single Aggregate Root  
**Scale target:** 100,000+ properties

---

## 1. Strategic decision: Property as the canonical object

LARSSH is a **Property Intelligence Platform**. Every business capability — search, market analytics, CRM, documents, maintenance, ROI — describes or acts upon **a property in the portfolio**.

Prior architecture treated `Property`, `Listing`, `Deal`, and `Viewing` as peer entities with independent repositories. That model breaks down at scale and in product semantics:

| Problem (entity-peer model) | Resolution (Property aggregate) |
|---|---|
| CRM deals disconnected from inventory | Offers are child records of Property |
| Intelligence computed per listing, not asset | Market stats, ROI, comparables attach to Property |
| Search returns listings, not assets | Search returns `PropertySummary` with optional current listing |
| 100k properties × full graph load | Section-based partial hydration |
| Duplicate ownership of location/spec | Single aggregate owns identity + specification |

**Decision:** `Property` is the **sole aggregate root**. Listings, viewings, offers, photos, and history are **entities within the aggregate**, not independent roots.

---

## 2. Bounded contexts and how they connect

```
                    ┌─────────────────────────────────┐
                    │         PropertyAggregate        │
                    │         (Aggregate Root)         │
                    └───────────────┬─────────────────┘
                                    │
     ┌──────────────┬───────────────┼───────────────┬──────────────┐
     │              │               │               │              │
 Search        Intelligence        CRM          Documents      Reports
 (summary)     (market bundle)  (workflow)      (media)       (history)
     │              │               │               │              │
     └──────────────┴───────────────┴───────────────┴──────────────┘
                         IPropertyDomainService
                         IPropertyAggregateRepository
```

| Feature module | Property sections loaded | Connection |
|---|---|---|
| Search Listings | `summary` profile | `PropertySummary` + `currentListing` |
| Property Intelligence | `intelligence` profile | `market.statistics`, `comparables`, `roi` |
| Market Intelligence | community-scoped aggregates | Many `PropertySummary` rolled up |
| CRM | `detail` workflow sections | `workflow.viewings`, `offers`, `tasks`, `notes` |
| Property Detail | `detail` profile | Full presentation minus maintenance (optional) |
| Communities | catalog + property counts | `PropertyLocation.communityId` |
| Dashboard | `summary` × N | Aggregated summaries |

**Rule:** No feature module may persist data without a `propertyId`. CRM leads convert to buyers/tenants on catalog repos, then attach to property workflow.

---

## 3. Aggregate structure

Implementation: `src/domain/property/`

```
PropertyAggregate
├── identity              PropertyIdentity
├── location              PropertyLocation
├── community             PropertyCommunity | null      (projection)
├── building              PropertyBuilding | null       (projection)
├── owner                 PropertyOwner | null
├── agentAssignment       PropertyAgentAssignment | null
├── specification         PropertySpecification
├── currentListing        PropertyListingRecord | null
├── previousListings      PropertyListingRecord[]
├── priceHistory          PriceHistoryRecord[]
├── rentalHistory         RentalHistoryRecord[]
├── saleHistory           SaleHistoryRecord[]
├── media                 PropertyMediaBundle
│   ├── photos
│   ├── videos
│   └── floorPlans
├── amenities             PropertyAmenity[]
├── maintenance           PropertyMaintenanceRecord[]
├── documents             PropertyDocument[]
├── workflow              PropertyWorkflowBundle
│   ├── viewings
│   ├── offers
│   ├── tasks
│   └── notes
├── market                PropertyMarketBundle
│   ├── statistics
│   ├── comparables
│   ├── roi
│   └── holidayHome
├── version               number                        (optimistic lock)
└── loadedSections        PropertyAggregateSection[]    (hydration metadata)
```

### 3.1 Identity

Stable business keys for integrations, search indexing, and audit.

| Field | Purpose |
|---|---|
| `id` | UUID — internal primary key, immutable |
| `propertyCode` | Human/business code (e.g. `DXB-MBR-1204`) |
| `unitNumber` | Unit within building |
| `createdAt`, `updatedAt`, `deletedAt` | Lifecycle; soft delete preserves history |

**Invariant:** `id` and `propertyCode` never change after creation.

### 3.2 Location

Physical placement in the portfolio hierarchy. Denormalized `masterCommunityName` supports search index without join at read time.

**Invariant:** `buildingId` must belong to `communityId` (enforced at create/update).

### 3.3 Community & Building

**Decision:** Community and Building are **reference catalogs**, not aggregate roots. The aggregate embeds read-only projections (`PropertyCommunity`, `PropertyBuilding`) populated at load time from catalog repositories.

Rationale: Communities are navigational and analytical groupings; they do not own transactional workflow. A community intelligence page aggregates many `PropertySummary` records — it never loads a "Community aggregate."

### 3.4 Owner

Reference to owner directory with embedded PII projection. **Decision:** Owner PII visibility is enforced in `IPropertyDomainService`, not in the domain type. The aggregate always knows `ownerId`; email/phone may be redacted per role.

### 3.5 Current & Previous Listings

A property may have zero or one **current** active listing and a history of prior market offers.

**Invariants:**
- At most one listing with status `ACTIVE` or `PUBLISHED` per property
- `currentListing` must appear in `previousListings` once superseded
- All listings reference `agentId` consistent with `agentAssignment` when active

### 3.6 Price, Rental, Sale History

Append-only financial timelines. Partitioned at persistence layer for 100k+ scale (see `DATABASE_DESIGN.md`).

| Collection | Source events |
|---|---|
| `priceHistory` | Listing price changes, valuations |
| `rentalHistory` | Lease records, tenant link |
| `saleHistory` | Closed transactions |

**Decision:** History records optionally link to `listingId` but always belong to the property aggregate boundary.

### 3.7 Media, Amenities, Maintenance, Documents

| Section | Storage | Notes |
|---|---|---|
| Photos, videos, floor plans | Object storage + DB metadata | `PropertyMediaBundle` |
| Amenities | Junction to amenity catalog | Many-to-many denormalized at read |
| Maintenance | Operational records | Optional section — excluded from default `detail` profile |
| Documents | Object storage + access ACL | Service-layer permission gate |

### 3.8 Workflow (CRM)

`PropertyWorkflowBundle` groups operational entities that agents act on daily:

- **Viewings** — scheduled visits linked to listing + buyer/tenant
- **Offers** — deal pipeline (formerly standalone "Deal" entity)
- **Tasks** — property-scoped action items
- **Notes** — internal commentary with audit trail

**Decision:** CRM UI may show cross-property lists (today's viewings), but persistence APIs are nested under `/properties/:id/viewings`. Cross-property queries are **read projections**, not separate aggregate writes.

### 3.9 Market Intelligence

`PropertyMarketBundle` holds **pre-computed read models**:

| Field | Computation |
|---|---|
| `statistics` | Rolled up from comparables set + community index |
| `comparables` | Similarity-scored peer properties |
| `roi` | Yield, appreciation, investment score |
| `holidayHome` | Short-stay metrics when `specification.isHolidayHome` |

**Decision:** Market data is refreshed asynchronously (`refreshMarketData`, `refreshComparables` on repository). UI reads snapshots — never computes ROI inline.

### 3.10 Agent Assignment

Current listing agent embedded for search cards and detail header. Historical agent changes live in listing records and audit log.

---

## 4. PropertySummary — list projection

List endpoints, search, dashboards, and comparables return **`PropertySummary`**, never full aggregates.

```typescript
PropertySummary = {
  identity, location, community, building,
  specification, currentListing, agentAssignment,
  market: { statistics, roi }  // partial market bundle
}
```

**Decision:** Prevents accidental N+1 loading of photos, notes, and history on list pages. Aligns with `property_search_index` read model in database design.

---

## 5. Partial loading (sections & profiles)

At 100k+ properties, loading the full aggregate is expensive. Sections enable selective hydration.

| Profile | Use case | Sections |
|---|---|---|
| `summary` | Search results, dashboard cards | 8 core sections |
| `detail` | Property detail UI | 22 sections (excludes maintenance, full history) |
| `intelligence` | Property/market intelligence | Financial + market sections |
| `full` | Admin export, audit | All 26 sections |

API: `GET /api/v1/properties/:id?profile=intelligence`  
Service: `getByProfile(propertyId, 'intelligence')`

Implementation: `resolveLoadSections()` in `src/domain/property/sections.ts`

---

## 6. Repository architecture

```
IRepositoryRegistry
├── property                    IPropertyAggregateRepository   ← aggregate root
├── propertyChildren
│   ├── listings                IPropertyListingRepository
│   ├── offers                  IPropertyOfferRepository
│   └── viewings                IPropertyViewingRepository
└── catalog                     ICatalogRepositoryRegistry
    ├── communities, buildings, agents, owners, buyers, tenants
```

### 6.1 IPropertyAggregateRepository

Central persistence boundary:

| Operation | Returns |
|---|---|
| `create`, `load`, `loadByCode`, `save`, `patch`, `delete` | `PropertyAggregate` |
| `search`, `filter`, `findMany` | `PaginatedResult<PropertySummary>` |
| `findComparables`, `findSimilar` | `PropertySummary[]` |
| `refreshMarketData`, `refreshComparables`, `reindex` | void (commands) |

### 6.2 Property-scoped child repositories

Targeted writes without full aggregate load:

- Publish listing → `propertyChildren.listings.create(propertyId, …)`
- Record offer → `propertyChildren.offers.create(propertyId, …)`
- Schedule viewing → `propertyChildren.viewings.create(propertyId, …)`

Every method **requires `propertyId`** as first argument — enforces aggregate boundary at the type level.

### 6.3 Catalog repositories

CRUD for reference directories. `IOwnerDirectoryRepository.findPropertyIds(ownerId)` links catalog back to properties without making Owner an aggregate root.

### 6.4 Legacy migration

| Deprecated | Replacement |
|---|---|
| `IPropertyRepository` | `IPropertyAggregateRepository` |
| `IListingRepository` | `IPropertyListingRepository` + property scope |
| `IDealRepository` | `IPropertyOfferRepository` |
| `IViewingRepository` | `IPropertyViewingRepository` |
| `ICommunityRepository` | `ICommunityCatalogRepository` |

Legacy Prisma implementation in `src/lib/repositories/property.repository.ts` remains until aggregate repository is implemented.

---

## 7. Service layer

**`IPropertyDomainService`** is the single application entry point for property operations.

Responsibilities:
1. Authorization (owner PII, documents)
2. Aggregate invariants (listing uniqueness, version conflicts)
3. Load profile selection
4. Orchestration across catalog + aggregate repos
5. Mapping to feature view models (via feature mappers — not in service)

Catalog services (`ICatalogServiceRegistry`) handle community/building/agent/owner admin separately.

---

## 8. API design (property-centric)

Primary resource:

```
/api/v1/properties
/api/v1/properties/search
/api/v1/properties/:id?profile=summary|detail|intelligence|full
/api/v1/properties/:id/comparables
/api/v1/properties/:id/similar
```

Nested child resources (property-scoped):

```
/api/v1/properties/:propertyId/listings
/api/v1/properties/:propertyId/offers
/api/v1/properties/:propertyId/viewings
/api/v1/properties/:propertyId/tasks
/api/v1/properties/:propertyId/notes
/api/v1/properties/:propertyId/media
/api/v1/properties/:propertyId/documents
/api/v1/properties/:propertyId/market/refresh
```

Legacy top-level routes (`/api/v1/deals`, `/api/v1/viewings`) remain deprecated aliases redirecting to property-scoped handlers.

Catalog routes unchanged: `/api/v1/communities`, `/agents`, `/owners`, etc.

---

## 9. Aggregate invariants (enforcement matrix)

| Invariant | Enforced by |
|---|---|
| Immutable `identity.id` | Repository (reject updates) |
| Building ∈ Community | Domain service on create/update |
| One active listing | Domain service + DB unique partial index |
| Child records reference property | Repository (propertyId required) |
| Optimistic concurrency | `version` field on save |
| Owner PII access | Domain service authorization |
| Document access | Domain service + storage ACL |
| Market data freshness | Async refresh jobs |

---

## 10. Feature → Property traceability

| User-facing capability | Property touchpoint |
|---|---|
| Search filter by community | `PropertySummary.location.communityId` |
| Listing price on card | `PropertySummary.currentListing.listPrice` |
| ROI badge | `PropertySummary.market.roi.investmentScore` |
| Schedule viewing (CRM) | `workflow.viewings` append on property |
| Deal pipeline (CRM) | `workflow.offers` on property |
| Comparable table | `market.comparables` |
| Holiday home score | `market.holidayHome` |
| Agent on card | `agentAssignment` |
| Owner portfolio | Catalog `findPropertyIds` → load summaries |
| Community intelligence | Aggregate many summaries by `communityId` |

---

## 11. ADR summary

| ADR | Decision | Rationale |
|---|---|---|
| ADR-P01 | Single aggregate root (Property) | Product semantics; consistent API |
| ADR-P02 | PropertySummary for lists | Performance at 100k+ scale |
| ADR-P03 | Section-based hydration | Avoid over-fetching |
| ADR-P04 | Catalog vs aggregate split | Communities don't own transactions |
| ADR-P05 | Pre-computed market bundle | Read-heavy intelligence workloads |
| ADR-P06 | Property-scoped child repos | Targeted writes without full load |
| ADR-P07 | Domain layer free of Prisma | Features import `@/domain/property` |
| ADR-P08 | Legacy peer repos deprecated | Gradual migration without UI breakage |

---

## 12. Implementation checklist

- [x] Domain model (`src/domain/property/`)
- [x] Aggregate repository interface
- [x] Property-scoped child repository interfaces
- [x] Catalog repository registry
- [x] Property-centric service registry
- [x] API route map (nested + legacy)
- [ ] Prisma `PropertyAggregateRepository` implementation
- [ ] Migrate `/search` from legacy repository
- [ ] Wire CRM mock to property workflow types
- [ ] Background jobs for market refresh

---

## 13. Related documents

- [FEATURE_ARCHITECTURE.md](./FEATURE_ARCHITECTURE.md) — layer diagram + feature modules
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — persistence schema aligned to aggregate
- [API_DESIGN.md](./API_DESIGN.md) — REST conventions
- [PHASE-2-ARCHITECTURE.md](./PHASE-2-ARCHITECTURE.md) — interface inventory
