# Prisma Migrations

Apply in order on Supabase PostgreSQL (`DATABASE_URL` + `DIRECT_URL` in `.env.local`):

| Migration | Description |
|---|---|
| `20250701120000_init` | Base schema |
| `20250701140000_sprint1_property_domain` | Property domain extensions |
| `20250701160000_production_normalize` | Organization, Users, MasterCommunity |
| `20250701180000_import_listing_fields` | Quality score, external reference |
| `20250701190000_final_production_import_schema` | **Final import-ready schema** |
| `20250701200000_add_property_type_duplex` | Add `DUPLEX` to PropertyType enum |

```bash
npm run db:migrate:deploy
npm run db:generate
```

See [PRODUCTION_DATABASE.md](../../docs/PRODUCTION_DATABASE.md) for the complete design rationale.
