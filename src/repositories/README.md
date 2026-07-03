# Repositories (interfaces)

TypeScript interfaces for data access. **No aggregate implementations in Phase 2** (legacy Prisma property repo still active for `/search`).

## Property-centric layout

| Path | Role |
|---|---|
| `property/aggregate.repository.ts` | **IPropertyAggregateRepository** — sole aggregate root |
| `property/child-repositories.ts` | Property-scoped listings, offers, viewings |
| `catalog/catalog.registry.ts` | Reference directories (communities, agents, owners…) |
| `repository-registry.ts` | **IRepositoryRegistry** — property + children + catalog |

## Legacy (deprecated)

| File | Replacement |
|---|---|
| `property.repository.ts` | `property/aggregate.repository.ts` |
| `listing.repository.ts` | `property/child-repositories.ts` → listings |
| `deal.repository.ts` | `property/child-repositories.ts` → offers |
| `viewing.repository.ts` | `property/child-repositories.ts` → viewings |
| `community.repository.ts` | `catalog/catalog.registry.ts` → communities |
| `building.repository.ts` | catalog → buildings |
| `agent.repository.ts` | catalog → agents |
| `owner.repository.ts` | catalog → owners |
| `buyer.repository.ts` | catalog → buyers |
| `tenant.repository.ts` | catalog → tenants |

See [`docs/PROPERTY_DOMAIN.md`](../../docs/PROPERTY_DOMAIN.md) and [`docs/PHASE-2-ARCHITECTURE.md`](../../docs/PHASE-2-ARCHITECTURE.md).
