# LARSSH — Database Design

**Version:** 2.0  
**Engine:** PostgreSQL 15+  
**ORM:** Prisma 6.x  
**Domain model:** Property aggregate — see [PROPERTY_DOMAIN.md](./PROPERTY_DOMAIN.md)  
**Scale target:** 100,000+ properties · 500,000+ listing history rows · 10M+ media metadata rows

---

## 1. Design principles

| Principle | Rationale |
|---|---|
| **Normalized core, denormalized read paths** | Writes stay consistent; search and analytics use indexes/materialized views |
| **UUID primary keys** | Safe distributed ID generation; no enumeration attacks |
| **Soft delete where business requires history** | Listings, deals retain history; hard delete for GDPR erasure only |
| **Timestamps on every row** | `created_at`, `updated_at`; `deleted_at` where soft delete applies |
| **Decimal for money and sqft** | Never float for `list_price`, `commission_amount`, `square_feet` |
| **Partition large history tables** | `price_history`, `listing_events` partitioned by year |
| **Row-level security ready** | Schema supports org/branch columns for future multi-tenant RLS |
| **Media metadata in DB, blobs in object storage** | DB stores URLs, dimensions, mime — not binary |

---

## 2. Entity relationship overview

> **Aggregate boundary:** `properties` is the aggregate root. `listings`, `deals`, `viewings`, media, and history tables are **child entities** owned by a property — not independent roots. Application code loads them via `PropertyAggregate` sections.

```
organizations ──► branches ──► users ──► user_roles ──► roles ──► role_permissions ──► permissions

communities ──► buildings ──► properties ──► listings
                    │              │              │
                    │              │              ├──► price_history
                    │              │              ├──► rental_history
                    │              │              └──► sale_history
                    │              │
                    │              ├──► property_amenities ──► amenities
                    │              ├──► photos / videos / floor_plans
                    │              ├──► documents
                    │              └──► notes

owners ──► properties          agents ──► listings, deals, viewings, commissions
buyers ──► deals, viewings      tenants ──► viewings

listings ──► deals ──► commissions
listings ──► viewings

market_statistics ──► communities, buildings (scope)
comparables ──► properties, listings (subject + comp pairs)
holiday_homes ──► properties (extended attributes)

tasks ──► users, agents (assignee)
property_search_index ──► denormalized read model
```

---

## 3. Core domain tables

### 3.1 `organizations`

Brokerage top-level tenant (single org initially; schema supports multi-org).

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR(255) | Legal entity name |
| slug | VARCHAR(100) UNIQUE | URL-safe identifier |
| default_currency | CHAR(3) | Default `USD` |
| settings | JSONB | Org-wide config |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.2 `branches`

Physical or logical office.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| organization_id | UUID FK | |
| name | VARCHAR(255) | |
| city, state, country | VARCHAR | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### 3.3 `communities`

Master-planned community or residential project (maps to UI master/project hierarchy).

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| organization_id | UUID FK | Nullable until multi-org |
| parent_community_id | UUID FK | Self-ref for master → project |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) UNIQUE | |
| description | TEXT | |
| master_name | VARCHAR(255) | e.g. "Al Hamra Village" |
| city, state, country | VARCHAR | |
| postal_code | VARCHAR(20) | |
| latitude, longitude | DECIMAL | |
| metadata | JSONB | Lifestyle, nearby POIs cache |
| created_at, updated_at | TIMESTAMPTZ | |

**Indexes:** `(slug)`, `(master_name, name)`, `(city, state)`

**Existing Prisma model:** `Community` — extend with `parent_community_id`, `master_name`, `organization_id`.

---

### 3.4 `buildings`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| community_id | UUID FK | |
| name | VARCHAR(255) | |
| code | VARCHAR(50) | Building code e.g. "Tower A" |
| address_line1, address_line2 | VARCHAR | |
| city, state, postal_code, country | VARCHAR | |
| total_floors | INT | |
| total_units | INT | Denormalized count |
| year_built | INT | |
| created_at, updated_at | TIMESTAMPTZ | |

**Indexes:** `(community_id)`, `(community_id, name)`

---

### 3.5 `properties`

Canonical inventory unit. **Target: 100k+ rows.**

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| building_id | UUID FK | |
| owner_id | UUID FK | Restrict delete |
| unit_number | VARCHAR(50) | |
| property_code | VARCHAR(50) UNIQUE | Business key e.g. PAC-2401 |
| floor | INT | |
| square_feet | DECIMAL(10,2) | |
| bedrooms | INT | 0 = studio |
| bathrooms | DECIMAL(3,1) | |
| property_type | ENUM | APARTMENT, VILLA, … |
| furnishing | ENUM | |
| view | ENUM | |
| status | ENUM | VACANT, OCCUPIED, … |
| is_holiday_home | BOOLEAN | Default false |
| created_at, updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

**Indexes:** `(building_id)`, `(owner_id)`, `(property_code)`, `(property_type, bedrooms)`, `(building_id, status)`

**Existing Prisma model:** `Property` — add `property_code`, `is_holiday_home`, `deleted_at`.

---

### 3.6 `listings`

Market offers on properties. Historical listings retained.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK | |
| agent_id | UUID FK | |
| title | VARCHAR(500) | |
| description | TEXT | |
| list_price | DECIMAL(12,2) | |
| currency | CHAR(3) | |
| listing_type | ENUM | SALE, RENT |
| status | ENUM | DRAFT, ACTIVE, … |
| listed_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | |
| sold_at | TIMESTAMPTZ | |
| days_on_market | INT | Computed/cached |
| created_at, updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

**Indexes:** `(property_id, status)`, `(agent_id, status)`, `(listing_type, status, list_price)`, `(listed_at DESC)`

---

## 4. History & analytics tables

### 4.1 `price_history`

Append-only log of list price changes.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| listing_id | UUID FK | |
| property_id | UUID FK | Denormalized for queries |
| price | DECIMAL(12,2) | |
| currency | CHAR(3) | |
| source | VARCHAR(50) | manual, import, sync |
| recorded_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**Partition:** RANGE by `recorded_at` year.  
**Index:** `(property_id, recorded_at DESC)`, `(listing_id, recorded_at DESC)`

---

### 4.2 `rental_history`

Closed rental transactions or achieved rent benchmarks.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK | |
| listing_id | UUID FK | Nullable |
| tenant_id | UUID FK | Nullable |
| annual_rent | DECIMAL(12,2) | |
| currency | CHAR(3) | |
| lease_start, lease_end | DATE | |
| recorded_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

---

### 4.3 `sale_history`

Closed sale transactions.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK | |
| listing_id | UUID FK | Nullable |
| buyer_id | UUID FK | Nullable |
| sale_price | DECIMAL(12,2) | |
| currency | CHAR(3) | |
| closed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

---

### 4.4 `market_statistics`

Pre-aggregated market metrics by scope and period.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| scope_type | ENUM | COMMUNITY, BUILDING, PROPERTY_TYPE, … |
| scope_id | UUID | FK polymorphic via type |
| period | ENUM | DAILY, WEEKLY, MONTHLY, QUARTERLY |
| period_start | DATE | |
| avg_asking_price | DECIMAL(12,2) | |
| avg_price_per_sqft | DECIMAL(10,2) | |
| avg_rent | DECIMAL(12,2) | |
| avg_roi | DECIMAL(5,2) | |
| avg_days_on_market | INT | |
| median_price | DECIMAL(12,2) | |
| lowest_price, highest_price | DECIMAL(12,2) | |
| supply_level | VARCHAR(20) | Low, Balanced, High |
| demand_level | VARCHAR(20) | |
| market_confidence | DECIMAL(5,2) | 0–100 |
| active_listings_count | INT | |
| sample_size | INT | |
| computed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**Indexes:** `(scope_type, scope_id, period, period_start DESC)` UNIQUE

**Scale:** Refresh via background job; UI reads pre-computed rows only.

---

### 4.5 `comparables`

Subject-to-comp relationships for intelligence modules.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| subject_property_id | UUID FK | |
| subject_listing_id | UUID FK | Nullable |
| comp_property_id | UUID FK | |
| comp_listing_id | UUID FK | Nullable |
| similarity_score | DECIMAL(5,2) | 0–100 |
| price_difference_pct | DECIMAL(6,2) | |
| distance_meters | INT | Nullable |
| matched_on | VARCHAR[] | beds, sqft, view, … |
| computed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**Indexes:** `(subject_property_id, similarity_score DESC)`

---

### 4.6 `holiday_homes`

Extended attributes for vacation rental investment scoring.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK UNIQUE | 1:1 with property |
| holiday_home_score | INT | 0–100 |
| avg_occupancy_rate | DECIMAL(5,2) | |
| avg_nightly_rate | DECIMAL(10,2) | |
| peak_season | VARCHAR(50) | |
| short_stay_allowed | BOOLEAN | |
| management_company | VARCHAR(255) | |
| notes | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

---

## 5. People & access control

### 5.1 `users`

Platform login identity — linked to Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Matches Supabase `auth.users.id` |
| email | VARCHAR(255) UNIQUE | |
| full_name | VARCHAR(255) | |
| avatar_url | TEXT | |
| branch_id | UUID FK | Nullable |
| status | ENUM | ACTIVE, SUSPENDED, INVITED |
| last_login_at | TIMESTAMPTZ | |
| created_at, updated_at | TIMESTAMPTZ | |

**Note:** Existing `Profile` model merges into `users` in Phase 2 migration.

---

### 5.2 `roles`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| organization_id | UUID FK | |
| name | VARCHAR(100) | admin, managing_broker, agent, analyst, ops |
| description | TEXT | |
| is_system | BOOLEAN | Cannot delete system roles |
| created_at, updated_at | TIMESTAMPTZ | |

---

### 5.3 `permissions`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | VARCHAR(100) UNIQUE | e.g. `owner:read`, `listing:write` |
| resource | VARCHAR(50) | |
| action | VARCHAR(50) | read, write, delete, export |
| description | TEXT | |

---

### 5.4 `role_permissions`

| role_id | UUID FK | |
| permission_id | UUID FK | |
| PRIMARY KEY (role_id, permission_id) | | |

---

### 5.5 `user_roles`

| user_id | UUID FK | |
| role_id | UUID FK | |
| branch_id | UUID FK | Nullable — branch-scoped role |
| granted_at | TIMESTAMPTZ | |
| PRIMARY KEY (user_id, role_id, branch_id) | | |

---

### 5.6 `agents`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | Nullable — links to users |
| email | VARCHAR UNIQUE | |
| phone | VARCHAR | |
| full_name | VARCHAR | |
| license_number | VARCHAR | |
| agency_name | VARCHAR | |
| branch_id | UUID FK | |
| created_at, updated_at | TIMESTAMPTZ | |

**Existing Prisma model:** `Agent` — add `user_id`, `branch_id`; rename `profileId` → `user_id`.

---

### 5.7 `owners`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | Nullable |
| email, phone, full_name | VARCHAR | |
| consent_marketing | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

**Security:** Encrypted at rest for phone/email (application layer); access via `owner:read` permission.

---

### 5.8 `buyers` / 5.9 `tenants`

Same shape as existing Prisma models; add `user_id`, `branch_id`, preference JSONB for CRM:

```json
{ "budget_min": 0, "budget_max": 0, "preferred_areas": [], "bedrooms": 2 }
```

---

## 6. CRM & workflow

### 6.1 `deals`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| listing_id | UUID FK | |
| buyer_id | UUID FK | |
| agent_id | UUID FK | |
| status | ENUM | INQUIRY … CLOSED |
| offer_price, agreed_price | DECIMAL | |
| currency | CHAR(3) | |
| opened_at, closed_at | TIMESTAMPTZ | |
| salesforce_opportunity_id | VARCHAR | Phase 3 |
| created_at, updated_at | TIMESTAMPTZ | |

---

### 6.2 `viewings`

Existing schema adequate; add `branch_id`, `outcome_notes`, `feedback_score`.

---

### 6.3 `tasks`

CRM tasks module.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | VARCHAR(500) | |
| description | TEXT | |
| assignee_user_id | UUID FK | |
| assignee_agent_id | UUID FK | Nullable |
| related_entity_type | VARCHAR | deal, viewing, property, lead |
| related_entity_id | UUID | |
| due_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| priority | ENUM | LOW, MEDIUM, HIGH |
| status | ENUM | PENDING, COMPLETED, CANCELLED |
| recurrence_rule | VARCHAR | iCal RRULE |
| created_at, updated_at | TIMESTAMPTZ | |

**Indexes:** `(assignee_user_id, status, due_at)`, `(due_at) WHERE status = PENDING`

---

### 6.4 `commissions`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| deal_id | UUID FK UNIQUE | |
| agent_id | UUID FK | |
| sale_price | DECIMAL | |
| commission_rate | DECIMAL(5,4) | e.g. 0.03 |
| commission_amount | DECIMAL | |
| currency | CHAR(3) | |
| status | ENUM | PENDING, APPROVED, PAID |
| paid_at | TIMESTAMPTZ | |
| created_at, updated_at | TIMESTAMPTZ | |

---

## 7. Media & documents

### 7.1 `photos`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK | |
| listing_id | UUID FK | Nullable |
| url | TEXT | CDN URL |
| thumbnail_url | TEXT | |
| caption | VARCHAR | |
| sort_order | INT | |
| width, height | INT | |
| mime_type | VARCHAR | |
| is_primary | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

**Scale:** 5–20 photos per property → 500k–2M rows at 100k properties. Index `(property_id, sort_order)`.

---

### 7.2 `videos`

Same as photos + `duration_seconds`, `poster_url`.

---

### 7.3 `floor_plans`

Same as photos + `page_count`, `pdf_url`.

---

### 7.4 `documents`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| entity_type | VARCHAR | property, listing, deal |
| entity_id | UUID | |
| document_type | ENUM | CONTRACT, DISCLOSURE, REPORT, OTHER |
| title | VARCHAR | |
| url | TEXT | |
| mime_type | VARCHAR | |
| uploaded_by_user_id | UUID FK | |
| created_at | TIMESTAMPTZ | |

---

### 7.5 `amenities` + `property_amenities`

**amenities:** canonical catalog (Pool, Gym, Concierge, …)  
**property_amenities:** M:N join with optional `notes`.

---

### 7.6 `notes`

Internal brokerage notes — polymorphic.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| entity_type | VARCHAR | property, owner, deal, viewing |
| entity_id | UUID | |
| author_user_id | UUID FK | |
| body | TEXT | |
| is_pinned | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

**Indexes:** `(entity_type, entity_id, created_at DESC)`

---

## 8. Read models (scale)

### 8.1 `property_search_index`

Denormalized table for Search module — refreshed on listing/property change.

| Column | Type | Notes |
|---|---|---|
| property_id | UUID PK | |
| listing_id | UUID | Active listing |
| property_code | VARCHAR | |
| community_id, community_name | | |
| master_community_name | VARCHAR | |
| building_id, building_name | | |
| listing_type | ENUM | |
| list_price | DECIMAL | |
| square_feet | DECIMAL | |
| bedrooms, bathrooms | | |
| property_type, furnishing, view | | |
| agent_id, agent_name | | |
| owner_id | VARCHAR | Masked or omitted for non-privileged |
| price_per_sqft | DECIMAL | Computed |
| market_difference_pct | DECIMAL | From comparables |
| status | ENUM | |
| search_vector | TSVECTOR | Full-text |
| indexed_at | TIMESTAMPTZ | |

**Indexes:** GIN on `search_vector`; B-tree on filter columns; composite for common filter combos.

**Alternative at scale:** OpenSearch/Elasticsearch cluster syncing from CDC.

---

## 9. Migration from current schema

| Current Prisma model | Action |
|---|---|
| Profile | Merge → users |
| Community | Extend with parent, master_name |
| Building | Add code, total_units |
| Property | Add property_code, is_holiday_home, deleted_at |
| Agent, Owner, Buyer, Tenant | Add user_id, branch_id |
| Listing | Add days_on_market, deleted_at |
| Deal, Viewing | Add salesforce_id, branch_id |
| — | **Add all new tables** per sections 4–8 |

---

## 10. Performance & operations

| Concern | Strategy |
|---|---|
| **100k properties** | B-tree indexes; search via `property_search_index` |
| **History growth** | Partition price_history by year; archive > 7 years |
| **Market stats** | Batch compute; never aggregate live on request |
| **Media** | S3 + CloudFront; DB metadata only |
| **Backups** | Daily full + WAL continuous; PITR 30 days |
| **Read scaling** | Read replica for search, analytics, reports |
| **Connection pooling** | PgBouncer / Supabase pooler (existing DATABASE_URL) |

---

## 11. Data retention

| Data | Retention |
|---|---|
| Active properties/listings | Indefinite |
| Soft-deleted records | 90 days then hard purge |
| Price/rental/sale history | 10 years |
| AI query audit | 2 years |
| Sync audit (Salesforce) | 1 year |
| Session logs | 90 days |

---

*LARSSH Database Design v1.0 — Target schema for Phase 2*
