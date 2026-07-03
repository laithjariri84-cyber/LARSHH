# LARSSH — Database Relationships

**Version:** 3.0 (Production Normalized)  
**Engine:** PostgreSQL 15+ via Supabase  
**ORM:** Prisma 6.x

This document explains **every relationship** in the normalized production schema.

---

## 1. High-level graph

```
Organization
 ├── User ── UserRoleAssignment (AGENT | MANAGER | ADMIN)
 │    └── Agent (optional 1:1 extension when role = AGENT)
 └── MasterCommunity
      └── Community
           └── Building
                └── Property ──┬── Listing
                               ├── PriceHistory
                               ├── Viewing
                               ├── Offer
                               ├── Document
                               ├── Photo
                               ├── Video
                               ├── FloorPlan
                               └── PropertyNote

Owner ──► Property
Buyer ──► Deal
Tenant ──► Lease ──► Property
```

---

## 2. Organization & access control

### Organization → User (1:N)

| Cardinality | One organization employs many users |
|---|---|
| FK | `users.organization_id → organizations.id` |
| On delete | `RESTRICT` — cannot delete org with active users |
| Purpose | Multi-tenant root; all platform users belong to exactly one brokerage org |

**Decision:** Every `User.id` matches Supabase Auth `auth.users.id`. The application layer syncs auth signup to `users`.

### User → UserRoleAssignment (1:N)

| Cardinality | One user may hold multiple roles |
|---|---|
| FK | `user_role_assignments.user_id → users.id` |
| Unique | `(user_id, role)` — no duplicate role grants |
| Enum | `UserRole`: `AGENT`, `MANAGER`, `ADMIN` |
| Purpose | RBAC without duplicating user records |

**Decision:** Managers and Admins are **roles on User**, not separate tables. Only Agents need an extension table for license and agency metadata.

### User → Agent (1:0..1)

| Cardinality | Optional one-to-one |
|---|---|
| FK | `agents.user_id → users.id` |
| On delete | `CASCADE` — removing user removes agent profile |
| Purpose | Agent-specific fields: `licenseNumber`, `agencyName`, `phone` |

**Decision:** Email and full name live on `User` only (normalized — no duplicate identity on Agent).

---

## 3. Location hierarchy

### Organization → MasterCommunity (1:N)

| FK | `master_communities.organization_id → organizations.id` |
|---|---|
| Purpose | Master-planned developments belong to the brokerage org |

**Example:** "Al Hamra Village" is a MasterCommunity.

### MasterCommunity → Community (1:N)

| FK | `communities.master_community_id → master_communities.id` |
|---|---|
| Unique | `(master_community_id, slug)` — slug unique within master, not globally |
| Purpose | Sub-projects within a master development |

**Example:** "Al Hamra Golf Apartments" is a Community under "Al Hamra Village".

**Decision:** Replaced self-referential `parent_community_id` with explicit `MasterCommunity` entity for clarity and indexing.

### Community → Building (1:N)

| FK | `buildings.community_id → communities.id` |
|---|---|
| Indexes | `(community_id)`, `(community_id, name)`, `(community_id, code)` |

### Building → Property (1:N)

| FK | `properties.building_id → buildings.id` |
|---|---|
| Indexes | `(building_id)`, `(building_id, status)`, `(property_code)` unique |

**Property is the aggregate root** for inventory, media, and property-scoped workflow.

---

## 4. External parties (CRM)

These are **not** org users — they are customers and counterparties.

### Owner → Property (1:N)

| FK | `properties.owner_id → owners.id` |
|---|---|
| Purpose | Legal owner of inventory units |

### Buyer → Deal (1:N)

| FK | `deals.buyer_id → buyers.id` |
|---|---|
| Index | `(buyer_id, status)` for pipeline queries |

### Tenant → Lease (1:N)

| FK | `leases.tenant_id → tenants.id` |
|---|---|
| Index | `(tenant_id, status)` |

### Lease → Property (N:1)

| FK | `leases.property_id → properties.id` |
|---|---|
| Optional | `leases.listing_id → listings.id` — originating rental listing |
| Enum | `LeaseStatus`: DRAFT, ACTIVE, EXPIRED, TERMINATED |

**Decision:** Tenants connect to inventory through **Leases**, not directly to properties. Viewings may still reference tenants before a lease exists.

---

## 5. Property children

All rows below require `property_id` — enforcing the aggregate boundary.

### Property → Listing (1:N)

| FK | `listings.property_id → properties.id` |
|---|---|
| Also | `listings.agent_id → agents.id` |
| Enum | `Purpose` (replaces ListingType): FOR_SALE, FOR_RENT, FOR_LEASE, HOLIDAY_RENTAL, INVESTMENT |
| Enum | `ListingStatus`: DRAFT, ACTIVE, PENDING, SOLD, RENTED, WITHDRAWN, EXPIRED |

**Invariant:** At most one ACTIVE listing per property (enforced at service layer + partial unique index recommended in Phase 2).

### Property → PriceHistory (1:N)

Append-only log. Optional `listing_id` for listing-scoped price changes.

### Property → Viewing (1:N)

Scheduled visits. Links `agent`, optional `buyer` or `tenant`, and `listing`.

### Property → Offer (1:N)

Formal price submission. Optional `deal_id` when promoted to pipeline.

### Property → Document / Photo / Video / FloorPlan (1:N each)

| Model | Storage | On delete |
|---|---|---|
| Document | URL + mime metadata | CASCADE |
| Photo | URL + dimensions + sort order | CASCADE |
| Video | URL + duration | CASCADE |
| FloorPlan | URL + page count | CASCADE |

**Decision:** Binary content in Supabase Storage; DB holds metadata only.

### Property → PropertyNote (1:N)

| FK | `property_notes.author_user_id → users.id` |
|---|---|
| Purpose | Internal commentary with audit trail (distinct from Offer workflow) |

---

## 6. Deal pipeline

### Listing → Deal (1:N)

| FK | `deals.listing_id → listings.id` |
|---|---|
| Also | `deals.property_id` denormalized for property-scoped queries |
| Enum | `DealStatus`: INQUIRY → CLOSED / CANCELLED |

### Buyer → Deal (1:N)

Primary CRM relationship for sales pipeline.

### Offer → Deal (0..1:1)

| FK | `offers.deal_id → deals.id` unique |
|---|---|
| Purpose | Accepted offer links to formal deal record |

---

## 7. Required enums summary

| Enum | Used on | Values |
|---|---|---|
| **UserRole** | UserRoleAssignment | AGENT, MANAGER, ADMIN |
| **Purpose** | Property (optional), Listing (required) | FOR_SALE, FOR_RENT, FOR_LEASE, HOLIDAY_RENTAL, INVESTMENT |
| **PropertyType** | Property | APARTMENT, VILLA, … |
| **PropertyStatus** | Property | VACANT, OCCUPIED, UNDER_RENOVATION, OFF_MARKET |
| **ViewType** | Property | SEA, CITY, … |
| **Furnishing** | Property | UNFURNISHED, PARTIALLY_FURNISHED, FULLY_FURNISHED |
| **ListingStatus** | Listing | DRAFT, ACTIVE, … |
| **DealStatus** | Deal | INQUIRY, VIEWING, OFFER, … |

Supporting enums (not in required list but present): `UserStatus`, `OfferStatus`, `ViewingStatus`, `LeaseStatus`, `TaskPriority`, `TaskStatus`, `MarketStatisticsScope`, `MarketStatisticsPeriod`.

---

## 8. Index strategy

| Pattern | Example |
|---|---|
| FK columns | All foreign keys indexed |
| Composite filters | `(property_id, status)`, `(buyer_id, status)` |
| Time-series | `(property_id, recorded_at DESC)` on price_history |
| Search | `(property_code)` unique, `(master_community_id, slug)` unique |
| Soft delete | `(deleted_at)` on properties, listings |

---

## 9. Migrations

| Migration | Purpose |
|---|---|
| `20250701120000_init` | Base tables |
| `20250701140000_sprint1_property_domain` | Property domain extensions |
| `20250701160000_production_normalize` | **This normalization** |

Deploy:

```bash
npm run db:migrate:deploy
npm run db:generate
```

---

## 10. Related documents

- [PROPERTY_DOMAIN.md](./PROPERTY_DOMAIN.md) — aggregate model
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — scale and NFR details
- [BACKEND_SPRINT1.md](./BACKEND_SPRINT1.md) — API layer (separate from this schema change)
