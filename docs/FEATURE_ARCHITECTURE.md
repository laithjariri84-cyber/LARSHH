# LARSSH — Feature Architecture

**Version:** 2.0  
**Pattern:** Feature-First + **Property Aggregate (DDD)**  
**Scale target:** 100,000+ properties

> **Canonical domain model:** [PROPERTY_DOMAIN.md](./PROPERTY_DOMAIN.md)

---

## 1. Executive summary

LARSSH uses **feature-first architecture**: each business capability is a self-contained module under `src/features/` with its own components, view models, and (eventually) service adapters. Shared infrastructure — domain, repositories, services, API — lives outside features and is consumed through **interfaces only**.

**Property is the sole aggregate root.** Every feature connects back to `PropertyAggregate` or `PropertySummary`. See [PROPERTY_DOMAIN.md](./PROPERTY_DOMAIN.md).

**The UI is complete.** Phase 2+ wires data without redesigning screens.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  src/app/ (routes)  ·  src/features/*/components  ·  components/ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ view models only
┌───────────────────────────────▼─────────────────────────────────┐
│                     FEATURE ADAPTERS                             │
│  src/features/*/mappers  ·  src/features/*/services (thin)       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ ServiceResult<T>
┌───────────────────────────────▼─────────────────────────────────┐
│                      DOMAIN LAYER                                │
│  src/domain/property/  — PropertyAggregate, sections, invariants │
└───────────────────────────────┬─────────────────────────────────┘
                                │ aggregate types
┌───────────────────────────────▼─────────────────────────────────┐
│                      SERVICE LAYER                               │
│  IPropertyDomainService  — authorization, invariants, profiles │
└───────────────────────────────┬─────────────────────────────────┘
                                │ PropertyAggregate | PropertySummary
┌───────────────────────────────▼─────────────────────────────────┐
│                    REPOSITORY LAYER                              │
│  IPropertyAggregateRepository  +  property-scoped child repos    │
│  ICatalogRepositoryRegistry  (communities, agents, owners…)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     DATABASE LAYER                               │
│  src/lib/database/  ·  PostgreSQL  ·  search index  ·  object storage │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────┐
         │  API LAYER  src/api/  →  /api/v1/     │
         │  (same services; HTTP transport)       │
         └──────────────────────────────────────┘
```

---

## 2. Directory structure

```
src/
├── app/                    # Next.js App Router — routes only, no business logic
│   ├── (auth)/             # Login
│   ├── (dashboard)/        # Authenticated pages → feature experiences
│   └── auth/               # Auth API routes (Supabase)
│
├── features/               # Bounded contexts (see §4)
│   └── <feature>/
│       ├── README.md
│       ├── index.ts
│       ├── components/     # UI — React only
│       ├── types/          # View models (UI shapes)
│       ├── mappers/        # Entity → view model
│       ├── services/       # Thin adapters → src/services
│       ├── data/           # Mock data (removed when wired)
│       ├── lib/            # Formatters, generators (client-safe)
│       └── schemas/        # Zod input validation
│
├── components/             # Shared UI — shell + shadcn primitives
│   ├── ui/
│   ├── layout/
│   └── auth/
│
├── domain/                 # Enterprise domain — Property aggregate (no UI/Prisma)
│   └── property/
├── types/                  # Shared DTOs, pagination, legacy entity types
├── repositories/           # IPropertyAggregateRepository + catalog + child repos
├── services/               # IPropertyDomainService + catalog services
├── api/                    # REST handler interfaces + route map
│
└── lib/                    # Infrastructure
    ├── prisma.ts           # ORM client singleton
    ├── auth.ts             # Supabase session helpers
    ├── supabase/           # SSR auth clients
    ├── ui-only.ts          # Demo mode flag
    ├── database/           # DB client interfaces
    └── repositories/       # LEGACY — concrete property repo (migrate Phase 2)
```

---

## 3. Architectural decisions

### AD-01: Feature-first over layer-first

**Decision:** Organize by business domain (`features/search/`) not by technical role (`controllers/search`).

**Why:** A brokerage team owns "Search" end-to-end. Features deploy and evolve independently. At 100k properties, search indexing changes should not scatter across unrelated folders.

**Trade-off:** Some duplication in formatters until promoted to `src/lib/` or `src/components/`.

---

### AD-02: View models ≠ entities

**Decision:** Features define their own TypeScript types for UI (`PropertySearchResult`, CRM `Lead`). Shared entities live in `src/types/entities.ts` (Prisma-aligned).

**Why:** CRM kanban "Lead" is a workflow concept; database has `Buyer` + activity. Intelligence modules need computed fields (market confidence, difference %) not stored on `Property`.

**Rule:** Mappers in `features/*/mappers/` translate entity → view model. Components never import `@prisma/client`.

---

### AD-03: Interface-first data layer (Phase 2)

**Decision:** Define `IPropertyRepository`, `IPropertyService`, `IPropertiesApi` before implementations.

**Why:** Ten entities × three layers = 30 contracts. Locking interfaces lets UI, mobile, and Salesforce teams parallelize while DB team implements Prisma.

**Current state:** Interfaces exist; one legacy concrete repo in `lib/repositories/`.

---

### AD-04: ServiceResult over exceptions

**Decision:** Services return `{ ok: true, data } | { ok: false, error }`.

**Why:** API handlers need deterministic error mapping. Unexpected throws become 500s without context. Business rules (invalid deal transition) return 422 with code.

---

### AD-05: Repository CRUD + search + filter + pagination

**Decision:** Every repository implements the same six operations via `IBaseRepository`.

**Why:** Generic list endpoints, test fixtures, and admin tools share behavior. Domain-specific methods (`findSimilar`, `getCalendar`) extend the interface.

**Pagination:** `page`, `page_size`, max 100 — see `src/types/common.ts`.

---

### AD-06: Denormalized search index for scale

**Decision:** At 100k properties, search reads from `property_search_index` (or OpenSearch), not live JOINs.

**Why:** P95 < 300ms target impossible with 7-table joins on every filter change. Index refreshed async on listing/property mutation.

**Feature impact:** `features/search/` mapper reads search index DTO, not raw Property graph.

---

### AD-07: Pre-computed market statistics

**Decision:** Intelligence modules read `market_statistics` table, not aggregate on request.

**Why:** Property Intelligence report requires 16+ metrics. Live aggregation across comparables at request time does not scale.

**Feature impact:** `features/property-intelligence/` and `features/market-intelligence/` replace mock generators with service calls to stats + comparables repos.

---

### AD-08: Mock data isolation in `features/*/data/`

**Decision:** Mock files are explicitly named and never imported by services or repositories.

**Why:** Clear deletion path when wiring live data. `NEXT_PUBLIC_UI_ONLY=true` continues to work for demos.

---

### AD-09: API layer mirrors services

**Decision:** One REST resource per entity + intelligence endpoints. Handlers delegate to `IServiceRegistry` only.

**Why:** Mobile (Phase 6) and Salesforce (Phase 3) consume the same API as the web app. No special server-only shortcuts.

---

### AD-10: Auth at edge + permission at service

**Decision:** Supabase middleware validates session; services check `permission` codes (`owner:read`, `listing:write`).

**Why:** Route-level auth is insufficient — API routes and server actions share services. Owner PII requires `owner:read` even when user is authenticated.

---

### AD-11: No business logic in route files

**Decision:** `src/app/(dashboard)/*/page.tsx` imports one feature experience component. Zero Prisma.

**Why:** Testability and future migration to separate frontend if needed.

---

### AD-12: Legacy migration without UI break

**Decision:** Keep `lib/repositories/property.repository.ts` until `PrismaPropertyRepository implements IPropertyRepository` and feature services switch.

**Why:** `/search` and `/properties/[id]` are production paths. Big-bang migration risk unacceptable.

---

## 4. Feature module catalog

| Feature | Route | Data today | Target service(s) |
|---|---|---|---|
| **property-intelligence** | `/intelligence` | Mock | Property, Listing, MarketStats, Comparables, AI |
| **market-intelligence** | `/market` | Mock | MarketStats, Comparables, Listing |
| **crm** | `/crm` | Mock | Deal, Viewing, Task, Lead*, Agent |
| **search** | `/search` | Legacy Prisma | Property, Listing |
| **properties** | `/properties/[id]` | Legacy Prisma | Property, Listing, Owner†, Media |
| **communities** | `/communities/*` | Mock registry | Community, Building, MarketStats |
| **dashboard** | `/dashboard` | Mock | Aggregates across services |
| **listings** | — (in search) | Schema | Listing |
| **agents** | `/agents` | Placeholder | Agent |
| **owners** | — | Schema | Owner (restricted) |
| **buyers** | — | Schema | Buyer |
| **tenants** | — | Schema | Tenant |
| **analytics** | — | Planned | Warehouse reads |
| **salesforce** | — | Planned | Sync adapter |

\* Lead entity TBD — may map to Buyer + pipeline state.  
† Owner visible only with permission.

---

## 5. Feature internal structure

### 5.1 Standard layout

```
features/search/
├── README.md                 # Ownership, status, dependencies
├── index.ts                  # Public exports
├── components/               # React — presentation only
│   ├── listings-search-experience.tsx   # Page orchestrator
│   ├── listings-enterprise-table.tsx
│   └── ...
├── types/
│   └── index.ts              # PropertySearchResult, FilterOption
├── mappers/
│   └── search.mapper.ts      # Entity → PropertySearchResult
├── services/
│   └── search-properties.ts  # Calls IPropertyService (Phase 3)
├── schemas/
│   └── search-filters.schema.ts   # Zod — shared with API validation
└── data/                     # DELETE when wired
    └── mock-listings-search.ts
```

### 5.2 Orchestrator pattern

Each page has one **experience** component:
- `PropertyIntelligenceExperience`
- `MarketIntelligenceExperience`
- `CrmExperience`
- `ListingsSearchExperience`
- `CommunitiesExperience`

**Responsibilities:** Local UI state (tabs, drawers), compose child components, call hooks/services.

**Not responsible for:** SQL, permission checks, PDF generation logic (delegate to services).

---

## 6. Dependency rules (enforced by convention + lint Phase 2)

```
ALLOWED:
  features/*/components  →  @/components/*, @/features/<same>/types
  features/*/services  →  @/services, @/features/<same>/mappers
  features/*/mappers   →  @/types
  services (impl)      →  @/repositories, @/types
  repositories (impl)  →  @/lib/database, @/types
  api route handlers   →  @/services, @/api
  app/*/page.tsx       →  @/features/*/components

FORBIDDEN:
  features/*/components  →  @prisma/client
  features/*/components  →  @/repositories (direct)
  features/*/components  →  @/lib/prisma
  repositories           →  @/features/*
  types                  →  @/features/*
```

---

## 7. Cross-cutting concerns

### 7.1 Validation

- **API input:** Zod schemas in `features/*/schemas/` — re-export from `src/types` validation module (Phase 2)
- **Forms:** Same schemas via `react-hook-form` resolver (future)

### 7.2 Caching

| Data | Strategy |
|---|---|
| Search results | No cache (stale risk) — index is fast enough |
| Market statistics | CDN/cache 15 min TTL |
| Filter options | In-memory 5 min per process |
| Property detail | React cache / Next `fetch` cache 60s |

### 7.3 Real-time (Phase 5+)

WebSocket or Supabase Realtime for: deal stage changes, new viewing assignments, import job progress.

### 7.4 Observability

Every service method logs: `request_id`, `user_id`, `entity`, `duration_ms`. Slow queries > 500ms flagged.

---

## 8. Scaling checklist (100k properties)

| Concern | Solution | Owner layer |
|---|---|---|
| Search latency | `property_search_index` + GIN/OpenSearch | Repository |
| Intelligence report | Pre-computed `market_statistics` | Service |
| Media load | S3 + CDN; lazy load in UI | Infrastructure |
| Dashboard KPIs | Materialized aggregates | Analytics Phase 5 |
| Bulk import | Queue workers; batch 500 rows | API + Service |
| Connection pool | PgBouncer; read replica | Database |
| CRM pipeline | Indexed status columns | Repository |

---

## 9. Testing strategy (by layer)

| Layer | Test type |
|---|---|
| Features/components | React Testing Library — render with mock props |
| Mappers | Unit tests — entity fixtures → snapshot view models |
| Services | Unit tests — mock repositories |
| Repositories | Integration tests — test DB container |
| API | E2E — supertest against route handlers |

**UI-only mode:** `NEXT_PUBLIC_UI_ONLY=true` enables CI visual tests without database.

---

## 10. Migration path from current codebase

| Step | Action | UI impact |
|---|---|---|
| 1 | Expand schema per DATABASE_DESIGN.md | None |
| 2 | Implement Prisma repositories | None |
| 3 | Implement services + registry | None |
| 4 | Refactor `search-properties.ts` → `IPropertyService` | None |
| 5 | Replace mock generators with service calls | None — same props |
| 6 | Add `/api/v1/**` routes | None — optional parallel |
| 7 | Remove `features/*/data/mock*.ts` | None |
| 8 | Retire `lib/repositories/property.repository.ts` | None |

---

## 11. Related documents

| Document | Scope |
|---|---|
| [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) | Module capabilities and personas |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Tables, indexes, scale |
| [API_DESIGN.md](./API_DESIGN.md) | REST endpoints, auth, bulk ops |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | UI component catalog |
| [ROADMAP.md](./ROADMAP.md) | Phase delivery plan |
| [PHASE-2-ARCHITECTURE.md](./PHASE-2-ARCHITECTURE.md) | Interface inventory (technical appendix) |

---

## 12. Governance

**Adding a new feature module:**
1. Create `src/features/<name>/README.md` with owner and status
2. Add route in `src/app/(dashboard)/` importing experience component
3. Add nav item in `ParagonSidebar` if user-facing
4. Define view models in `features/<name>/types/`
5. Do **not** add Prisma calls in components
6. Register service dependency in PRODUCT_SPEC and this table

**Adding a new entity:**
1. Table in DATABASE_DESIGN.md
2. Types in `src/types/`
3. Interface in `src/repositories/` and `src/services/`
4. API contract in `src/api/resources/`
5. Prisma migration

---

*LARSSH Feature Architecture v1.0 — CTO Office*
