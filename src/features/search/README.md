# Search Feature

## Responsibility

Property discovery: filters, search results table, and filter option queries.

## Database

All data is loaded from PostgreSQL via Prisma:

- `src/lib/repositories/property.repository.ts` — raw queries
- `src/features/search/services/search-properties.ts` — maps records to `PropertySearchResult`
- `src/features/search/mappers/search.mapper.ts` — view model mapping

## Public exports

Use `@/features/search` for `searchProperties`, `getCommunityOptions`, `getBuildingOptions`, and filter schemas.
