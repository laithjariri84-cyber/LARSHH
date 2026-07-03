# Properties Feature

## Responsibility

Property detail views, read models, similar-property recommendations, and property-centric queries.

## Database

All data is loaded from PostgreSQL via Prisma:

- `src/lib/repositories/property.repository.ts` — `getPropertyById`, `getSimilarProperties`
- `src/features/properties/services/property-details.ts` — maps to `PropertyDetailsViewModel`
- `src/features/properties/mappers/property-details.mapper.ts` — view model mapping

## Route

`/properties/[id]` composes components from `src/features/properties/components/`.
