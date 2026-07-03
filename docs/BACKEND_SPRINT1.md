# Backend Sprint 1

Production database layer for LARSSH on **Supabase PostgreSQL**.

## Setup

1. Copy `.env.example` → `.env.local` and set `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (direct, port 5432).
2. Run migrations:
   ```bash
   npm run db:migrate:deploy
   ```
3. Generate client (also runs on `postinstall`):
   ```bash
   npm run db:generate
   ```

## Schema

All models in `prisma/schema.prisma`:

| Model | Role |
|---|---|
| Property | Aggregate root |
| Listing | Market offer on property |
| Deal | CRM pipeline (linked to property + listing) |
| Offer | Formal price submission |
| Viewing | Property-scoped visit |
| Task | Property-scoped CRM task |
| PriceHistory | Append-only price log |
| MarketStatistics | Pre-computed intelligence |
| ComparableProperty | Subject ↔ comp pairs |
| Community, Building, Agent, Owner, Buyer, Tenant | Reference catalogs |

Migration: `prisma/migrations/20250701140000_sprint1_property_domain/`

## Architecture

```
src/app/api/v1/          → HTTP route skeletons (Zod validated)
src/lib/services/        → PropertyDomainService + registry
src/lib/database/        → Prisma repositories + mappers
src/lib/validation/      → Zod schemas
src/lib/dto/             → API serialization helpers
src/domain/property/     → Aggregate types (no Prisma)
```

## API endpoints (skeleton)

| Method | Path |
|---|---|
| GET/POST | `/api/v1/properties` |
| GET/PATCH/DELETE | `/api/v1/properties/:id` |
| GET | `/api/v1/properties/search` |
| GET | `/api/v1/properties/filter-options` |
| GET | `/api/v1/properties/:id/comparables` |
| GET | `/api/v1/properties/:id/similar` |
| POST | `/api/v1/properties/:id/market/refresh` |
| GET/POST | `/api/v1/properties/:id/listings` |
| GET/POST | `/api/v1/properties/:id/offers` |
| GET/POST | `/api/v1/properties/:id/viewings` |
| GET/POST | `/api/v1/properties/:id/deals` |
| GET/POST | `/api/v1/properties/:id/tasks` |
| GET/POST | `/api/v1/properties/:id/price-history` |
| GET | `/api/v1/communities`, `/communities/:id` |
| GET | `/api/v1/agents`, `/agents/:id` |
| GET | `/api/v1/owners/:id`, `/owners/:id/portfolio` |

No seed data — populate via API or future import pipeline.
