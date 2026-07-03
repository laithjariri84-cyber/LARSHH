# Feature Modules — LARSSH

LARSSH uses **feature-based architecture**. Each folder under `src/features/` is a bounded context containing UI, view models, and (eventually) thin adapters to the service layer.

## Phase 2 data architecture

Phase 2 adds shared layers **without changing UI**:

| Layer | Path | Status |
|---|---|---|
| Types | `src/types/` | ✅ Interfaces & DTOs |
| Repositories | `src/repositories/` | ✅ Interfaces only (10 entities) |
| Services | `src/services/` | ✅ Interfaces only |
| Database | `src/lib/database/` | ✅ Interfaces only |
| API | `src/api/` | ✅ Interfaces + route map |
| Legacy Prisma | `src/lib/repositories/` | ⚠️ Property repo only (keep until Phase 3) |

Full documentation: [`docs/README.md`](../../docs/README.md) · start with [`FEATURE_ARCHITECTURE.md`](../../docs/FEATURE_ARCHITECTURE.md)

## Dependency rules

```
features/components  →  may use @/components, @/types (view models)
features/services    →  will call @/services (Phase 3)
services             →  calls @/repositories (interfaces)
repositories (impl)  →  calls @/lib/database / Prisma (Phase 3)
api handlers         →  calls @/services only
```

**Do not** import `@prisma/client` in feature components. **Do not** call repositories from UI components directly.

## Feature status

| Feature | UI | Data today | Phase 3 target |
|---|---|---|---|
| `property-intelligence/` | ✅ | Mock analytics | `IPropertyService` + listing comps |
| `market-intelligence/` | ✅ | Mock analytics | Property + listing repos |
| `search/` | ✅ | Legacy Prisma | `IPropertyService.search` |
| `properties/` | ✅ | Legacy Prisma | `IPropertyService.getById` |
| `communities/` | ✅ | Mock master data | `ICommunityService` |
| `crm/` | ✅ | Mock pipeline | Deal, Viewing, Agent, Buyer services |
| `dashboard/` | ✅ | Mock stats | Aggregated service queries |
| `listings/` | README | Prisma schema | `IListingService` |
| `agents/` | Placeholder | Seeded in DB | `IAgentService` |
| `owners/` | README | Seeded in DB | `IOwnerService` |
| `buyers/` | README | Prisma schema | `IBuyerService` |
| `tenants/` | README | Prisma schema | `ITenantService` |
| `analytics/` | README | — | Cross-cutting |
| `salesforce/` | README | — | External integration (future) |

## Typical feature layout

```
features/<name>/
├── README.md
├── index.ts              # Public exports
├── types/                # View models (UI shapes)
├── components/           # React UI
├── mappers/              # Entity → view model (Phase 3)
├── services/             # Thin wrappers → src/services (Phase 3)
├── data/                 # Mock data (remove when wired)
├── lib/                  # Client-side helpers, formatters
└── schemas/              # Zod validation (forms, API input)
```

## Shared infrastructure

| Path | Role |
|---|---|
| `src/components/` | App shell, layout, shadcn UI |
| `src/lib/prisma.ts` | Prisma singleton (legacy + Phase 3) |
| `src/lib/supabase/` | Auth |
| `src/lib/ui-only.ts` | UI-only mode flag |
| `prisma/` | Schema, migrations, seed |
