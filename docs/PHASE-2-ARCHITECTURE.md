# LARSSH — Phase 2 Data Architecture

This document defines the data architecture introduced in Phase 2. **No UI was changed.** Existing pages continue to use mock data or the legacy Prisma path in `src/lib/repositories/`.

---

## Layer overview

```
┌─────────────────────────────────────────────────────────────┐
│  UI (unchanged)                                             │
│  src/app/ · src/features/*/components · src/components/     │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Feature modules (presentation + view models)                 │
│  src/features/<domain>/                                     │
│    components/   UI only                                      │
│    types/        View models (PropertySearchResult, etc.)    │
│    mappers/      Entity → view model (Phase 3)              │
│    services/     Thin adapters calling src/services (Phase 3)│
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  API layer (interfaces)          src/api/                     │
│  REST contracts · route constants · handler types           │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Service layer (interfaces)      src/services/              │
│  Business rules · ServiceResult · orchestration             │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Repository layer (interfaces)   src/repositories/          │
│  CRUD · search · filter · pagination                          │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  Database layer (interfaces)     src/lib/database/          │
│  IDatabaseClient · transactions · registry factory            │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  PostgreSQL (Prisma schema)      prisma/                    │
│  Already defined — not wired to new interfaces yet          │
└─────────────────────────────────────────────────────────────┘

Shared types: src/types/
Infrastructure: src/lib/prisma.ts · src/lib/auth.ts · src/lib/supabase/
```

---

## Directory map

| Path | Responsibility |
|---|---|
| `src/types/` | Shared DTOs, pagination, filters, `IBaseRepository`, API/service result types |
| `src/repositories/` | **Interfaces only** — one per entity + `IRepositoryRegistry` |
| `src/services/` | **Interfaces only** — domain services + `IServiceRegistry` |
| `src/lib/database/` | **Interfaces only** — client, transactions, factory |
| `src/api/` | **Interfaces only** — REST handler contracts + `/api/v1/` route map |
| `src/features/` | Bounded contexts; UI + view models; mock data until wired |
| `src/components/` | Shared UI shell and primitives (unchanged) |
| `src/lib/repositories/` | **Legacy** — live Prisma property repository (kept for existing pages) |

---

## Architectural decisions

### 1. Feature-based modules (`src/features/`)

**Decision:** Keep one folder per business capability (search, properties, CRM, intelligence, etc.).

**Why:** UI teams work in bounded contexts. View models (`PropertySearchResult`, CRM kanban cards) stay separate from persistence entities (`Property`, `Deal`) so mock-driven pages do not leak into the database layer.

**Phase 2 rule:** Features may import from `@/types` and eventually `@/services`. They must not import Prisma directly (except legacy search/properties paths until migrated).

---

### 2. Repository pattern (`src/repositories/`)

**Decision:** Every entity repository extends `IBaseRepository` with six core operations:

| Operation | Purpose |
|---|---|
| `create` | Insert |
| `findById` | Read one |
| `findMany` | Read list with pagination + sort |
| `update` | Partial update |
| `delete` | Hard delete |
| `search` | Text/field search |
| `filter` | Structured filters |

**Why:** Predictable contracts allow swapping Prisma, in-memory, or mock implementations. Services and tests depend on interfaces, not SQL.

**Entity-specific methods** (e.g. `IPropertyRepository.findSimilar`, `IViewingRepository.findUpcoming`) live on the entity interface when they encode domain queries that do not fit generic CRUD.

**Legacy note:** `src/lib/repositories/property.repository.ts` is the only concrete implementation today. In Phase 3 it will implement `IPropertyRepository` without breaking `/search` or `/properties/[id]`.

---

### 3. Service layer (`src/services/`)

**Decision:** Services wrap repositories and return `ServiceResult<T>` instead of throwing.

**Why:**
- API routes map `NOT_FOUND` → 404, `VALIDATION_ERROR` → 400 consistently.
- Authorization and business rules (e.g. `listing.publish()`, `deal.advanceStatus()`) live here, not in handlers or repositories.
- Feature folders keep thin mappers; they do not embed business logic.

**Domain methods** on services express use cases (`getPipelineSummary`, `getCalendar`) rather than raw SQL shapes.

---

### 4. Database layer (`src/lib/database/`)

**Decision:** Introduce `IDatabaseClient`, `ITransactionClient`, and `IRepositoryRegistryFactory` without implementing them yet.

**Why:** Repositories should not call `prisma` as a global singleton forever. A client abstraction enables:
- Health checks before serving traffic
- Transaction boundaries (`deal` + `listing` status updates atomically)
- Test doubles that do not touch PostgreSQL

**Existing code:** `src/lib/prisma.ts` remains the runtime singleton until Phase 3 migration.

---

### 5. API layer (`src/api/`)

**Decision:** Define handler interfaces and route constants under `src/api/`; implement Next.js routes under `src/app/api/v1/` in Phase 3.

**Why:** Separating contracts from App Router files keeps HTTP concerns thin. Handlers delegate to `IServiceRegistry` only.

**Route layout:** RESTful `/api/v1/<resource>` with sub-routes for search, filter, and domain actions (`/publish`, `/pipeline`, `/calendar`).

**Current state:** No new route files added — existing auth routes under `src/app/auth/` unchanged.

---

### 6. Shared types (`src/types/`)

**Decision:** Centralize pagination, inputs, filters, and Prisma-aligned entities.

**Why:** Avoid duplicating `PaginatedResult` across ten repositories. Create/update DTOs are explicit TypeScript types (not `any`), aligned with `prisma/schema.prisma` but independent of `@prisma/client` in consumer code where possible.

**View models stay in features:** e.g. `features/crm/types` CRM kanban shapes remain UI-specific until mapped to `Deal` / `Viewing` entities in Phase 3.

---

### 7. Pagination standard

```typescript
PaginationParams: { page?, pageSize? }  // defaults: 1, 20; max pageSize: 100
PaginatedResult<T>: { data: T[]; pagination: PaginationMeta }
```

**Why:** One pagination contract across all list/search/filter endpoints and repository methods.

---

### 8. No database connection in Phase 2

**Decision:** Interfaces only — no new Prisma implementations, no new API route handlers.

**Why:** Establishes contracts first. Existing pages keep working:
- Mock features: intelligence, market, CRM, communities, dashboard
- Legacy DB: search + property details via `lib/repositories/property.repository.ts`

---

## Entity → feature mapping (Phase 3 target)

| Entity | Primary features | Repository | Service |
|---|---|---|---|
| Property | search, properties, intelligence | `IPropertyRepository` | `IPropertyService` |
| Listing | search, listings | `IListingRepository` | `IListingService` |
| Community | communities, market, intelligence | `ICommunityRepository` | `ICommunityService` |
| Building | search, communities | `IBuildingRepository` | `IBuildingService` |
| Agent | agents, CRM, search | `IAgentRepository` | `IAgentService` |
| Owner | properties (restricted) | `IOwnerRepository` | `IOwnerService` |
| Buyer | CRM deals | `IBuyerRepository` | `IBuyerService` |
| Tenant | CRM viewings | `ITenantRepository` | `ITenantService` |
| Deal | CRM pipeline | `IDealRepository` | `IDealService` |
| Viewing | CRM viewings | `IViewingRepository` | `IViewingService` |

---

## Phase 3 migration order (recommended)

1. Implement `PrismaPropertyRepository implements IPropertyRepository` — refactor legacy file
2. Implement remaining Prisma repositories
3. Implement service classes + `IServiceRegistry`
4. Refactor `features/search/services` and `features/properties/services` to use `IPropertyService`
5. Add `src/app/api/v1/**` route handlers
6. Replace mock data in intelligence, market, CRM, communities incrementally
7. Remove direct Prisma usage from feature folders

---

## Registries

| Registry | Location | Role |
|---|---|---|
| `IRepositoryRegistry` | `src/repositories/repository-registry.ts` | Inject all repos into services |
| `IServiceRegistry` | `src/services/service-registry.ts` | Inject all services into API/handlers |
| `IApiRegistry` | `src/api/api-registry.ts` | Group REST resource handlers |

**Why registries:** Constructor injection and test doubles without a DI framework. A single factory builds the graph for production vs. test.
