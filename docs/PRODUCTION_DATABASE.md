# LARSSH — Final Production Database Schema

**Version:** 4.0 (Import-ready)  
**Targets:** PF Expert listing import · future Salesforce sync  
**No mock data · no UI**

---

## 1. Design philosophy

| Principle | Decision |
|---|---|
| **Property = permanent** | Physical attributes imported once; rarely change |
| **Listing = dynamic** | Price, status, agent, marketing copy change with each market cycle |
| **One listing → one property** | `listings.property_id` NOT NULL, RESTRICT delete |
| **Full location chain on property** | Denormalized `master_community_id`, `community_id`, `building_id` for search without joins |
| **Integration keys** | `pf_expert_reference` / `pf_expert_ref` for upsert; `salesforce_id` for sync |
| **Money as Decimal** | Never float for prices or area |

---

## 2. Location hierarchy

```
Organization
 └── MasterCommunity  (pf_expert_ref, salesforce_id)
      └── Community   (pf_expert_ref, salesforce_id)
           └── Building (pf_expert_ref, salesforce_id)
                └── Property (master_community_id, community_id, building_id)
                     └── Listing
```

### Why denormalize location on Property?

PF Expert imports resolve location in one pass. Search filters by community and bedrooms are common — indexing `(community_id, bedrooms)` avoids joining through `buildings` on every query at 100k+ scale.

**Invariant (enforced at import service):**

```
property.building_id → building.community_id = property.community_id
property.community_id → community.master_community_id = property.master_community_id
```

---

## 3. Property — permanent fields

| Column | Type | Purpose |
|---|---|---|
| `property_code` | TEXT UNIQUE | Business key — stable across imports |
| `unit_number` | TEXT | Unit within building |
| `property_type` | PropertyType | APARTMENT, VILLA, … |
| `bedrooms` | INT | Search filter |
| `bathrooms` | DECIMAL(3,1) | Specification |
| `area_sqft` | DECIMAL(10,2) | Internal area (PF Expert "Area") |
| `view` | ViewType | SEA, CITY, … |
| `furnishing` | Furnishing | UNFURNISHED, … |
| `floor` | INT | Floor number |
| `latitude` | DECIMAL(10,7) | Geo — unit-level coordinates |
| `longitude` | DECIMAL(10,7) | Geo — unit-level coordinates |
| `salesforce_id` | TEXT UNIQUE | Future Property asset sync |

**Removed from Property (now on Listing or dropped):**

- `purpose`, `status`, `is_holiday_home` — these are market/occupancy dynamics, not permanent asset data
- `owner_id` is **optional** — properties can be imported before owner CRM record exists

---

## 4. Listing — dynamic fields

| Column | Maps to requirement |
|---|---|
| `asking_price` | Asking Price |
| `listing_type` | Rent or Sale (`SALE` \| `RENT`) |
| `status` | ListingStatus |
| `agent_id` | Agent |
| `description` | Description |
| `marketing_title` | Marketing Title |
| `published_at` | Published Date |
| `expires_at` | Expiry Date |
| `pf_expert_reference` | PF Expert Reference (unique upsert key) |
| `salesforce_id` | Salesforce ID (unique sync key) |
| `quality_score` | Quality Score (0–100) |

**PF Expert import flow:**

```
1. Upsert MasterCommunity / Community / Building by pf_expert_ref
2. Upsert Property by property_code (set location FKs)
3. Upsert Listing by pf_expert_reference (link property_id + agent_id)
4. Append PriceHistory when asking_price changes
```

**Salesforce sync flow (future):**

```
Listing.salesforce_id ↔ Salesforce Listing/Product object
Deal.salesforce_id    ↔ Opportunity
Agent/Owner/Buyer     ↔ Contact/Account
```

---

## 5. Search indexes

| Filter | Index |
|---|---|
| Property Code | `properties(property_code)` UNIQUE |
| Community | `properties(community_id)`, `(community_id, bedrooms)` |
| Building | `properties(building_id)`, `(building_id, bedrooms)` |
| Bedrooms | `properties(bedrooms)` |
| Price | `listings(asking_price)`, `(status, asking_price)` |
| Status | `listings(status)`, `(property_id, status)` |
| Listing type | `(listing_type, status, asking_price)` |
| PF Expert | `listings(pf_expert_reference)` UNIQUE |
| Salesforce | `listings(salesforce_id)` UNIQUE |

---

## 6. Relationships summary

| From | To | Cardinality | Notes |
|---|---|---|---|
| Listing | Property | N:1 | Every listing belongs to exactly one property |
| Property | MasterCommunity | N:1 | Denormalized FK |
| Property | Community | N:1 | Denormalized FK |
| Property | Building | N:1 | Canonical placement |
| Property | Owner | N:0..1 | Optional until CRM links |
| Listing | Agent | N:1 | Assigned listing agent |
| Buyer | Deal | 1:N | CRM pipeline |
| Tenant | Lease | 1:N | Rental occupancy |
| Lease | Property | N:1 | Tenant connects via lease |

---

## 7. Enums

| Enum | Values | Used on |
|---|---|---|
| **ListingType** | SALE, RENT | Listing |
| **ListingStatus** | DRAFT, ACTIVE, PENDING, SOLD, RENTED, WITHDRAWN, EXPIRED | Listing |
| **PropertyType** | APARTMENT, VILLA, … | Property |
| **ViewType** | SEA, CITY, … | Property |
| **Furnishing** | UNFURNISHED, … | Property |
| **DealStatus** | INQUIRY → CLOSED | Deal |
| **UserRole** | AGENT, MANAGER, ADMIN | UserRoleAssignment |

`PropertyStatus` enum retained in schema for future use but **not on Property table** — occupancy is derived from leases/listings.

---

## 8. Migrations (apply in order)

```
20250701120000_init
20250701140000_sprint1_property_domain
20250701160000_production_normalize
20250701180000_import_listing_fields
20250701190000_final_production_import_schema   ← this release
```

```bash
npm run db:migrate:deploy
npm run db:generate
```

---

## 9. Related documents

- [DATABASE_RELATIONSHIPS.md](./DATABASE_RELATIONSHIPS.md) — full ER reference
- [PROPERTY_DOMAIN.md](./PROPERTY_DOMAIN.md) — aggregate model
