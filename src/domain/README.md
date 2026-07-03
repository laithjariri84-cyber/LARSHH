# Domain Layer

The **domain layer** contains enterprise domain models with **no dependencies** on UI, HTTP, Prisma, or React.

## Aggregate root

**Property** is the sole aggregate root of LARSSH. All features — Search, Intelligence, CRM, Reports — operate on `PropertyAggregate` or `PropertySummary`.

```
src/domain/
└── property/
    ├── aggregate.ts       # PropertyAggregate, PropertySummary
    ├── sections.ts        # Partial load profiles
    ├── core.ts            # Identity, location, owner, spec
    ├── listings-history.ts
    ├── media-assets.ts
    ├── workflow.ts        # Viewings, offers, tasks, notes
    ├── market.ts          # Stats, comparables, ROI, holiday home
    └── inputs.ts          # Create/update/patch DTOs
```

## Rules

1. Features import from `@/domain/property` — not from `@prisma/client`
2. Child entities (listings, viewings, offers) are **part of the Property aggregate**, not independent roots
3. Community, Building, Agent, Owner directories are **reference catalogs** — not aggregate roots
4. Business invariants are enforced in `IPropertyDomainService`, not repositories

See [`docs/PROPERTY_DOMAIN.md`](../../docs/PROPERTY_DOMAIN.md).
