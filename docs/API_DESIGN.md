# LARSSH — API Design

**Version:** 1.0  
**Style:** REST  
**Base URL:** `https://{host}/api/v1`  
**Format:** JSON  
**Auth:** Bearer JWT (Supabase access token) + API key for integrations (Phase 3)

---

## 1. Design principles

| Principle | Decision |
|---|---|
| **REST over GraphQL** | Predictable caching, simpler mobile clients, easier Salesforce adapter |
| **Versioned prefix** | `/api/v1/` — breaking changes require v2 |
| **Thin handlers** | Route → Service → Repository; no Prisma in handlers |
| **Consistent envelopes** | Success and error bodies share structure across all endpoints |
| **Pagination everywhere** | All list/search/filter endpoints paginate by default |
| **Idempotent writes** | PUT/PATCH idempotent; POST create supports `Idempotency-Key` header |
| **Rate limiting** | 1000 req/min per user; 100 req/min for export/import |
| **Audit** | Mutations and exports log `user_id`, `request_id`, entity |

---

## 2. Authentication

### 2.1 User sessions (primary)

```
Authorization: Bearer <supabase_access_token>
```

**Flow:**
1. Client authenticates via Supabase Auth (existing `/login`)
2. Access token sent on every API request
3. Middleware validates token → resolves `user_id` → loads roles/permissions
4. Service layer enforces resource permissions

**Token refresh:** Client uses Supabase refresh token; API returns `401` with `code: TOKEN_EXPIRED` when access token invalid.

### 2.2 Service accounts (integrations)

```
Authorization: Bearer <api_key>
X-Paragon-Org-Id: <organization_uuid>
```

Used by Salesforce sync, bulk import jobs, mobile app (optional). Phase 3.

### 2.3 Context headers

| Header | Purpose |
|---|---|
| `X-Request-Id` | Correlation ID (generated if absent) |
| `X-Branch-Id` | Branch scope for multi-branch queries |
| `Idempotency-Key` | Duplicate-safe POST (imports, creates) |

---

## 3. Response envelope

### 3.1 Success

```json
{
  "data": { },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-07-01T12:00:00Z"
  }
}
```

### 3.2 Paginated success

```json
{
  "data": [ ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1542,
    "total_pages": 78,
    "has_next_page": true,
    "has_previous_page": false
  },
  "meta": { "request_id": "uuid" }
}
```

### 3.3 Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": {
      "list_price": ["Must be greater than 0"]
    }
  },
  "meta": { "request_id": "uuid" }
}
```

### 3.4 HTTP status mapping

| Status | `error.code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 403 | `FORBIDDEN` | Insufficient permission |
| 404 | `NOT_FOUND` | Entity missing |
| 409 | `CONFLICT` | Duplicate slug, stale version |
| 422 | `BUSINESS_RULE_VIOLATION` | Invalid state transition |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 4. Common query parameters

Applies to all `GET` list, search, and filter endpoints.

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | 1 | — | Page number (1-based) |
| `page_size` | integer | 20 | 100 | Items per page |
| `sort_by` | string | `created_at` | — | Field name (allowlist per resource) |
| `sort_order` | `asc` \| `desc` | `desc` | — | Sort direction |
| `q` | string | — | 500 chars | Full-text search query |
| `fields` | string | — | — | Sparse fieldset: `fields=id,name,price` |
| `include` | string | — | — | Related resources: `include=building,agent` |

---

## 5. Resource endpoints

### 5.1 Properties

| Method | Path | Description | Permission |
|---|---|---|---|
| GET | `/properties` | List properties | `property:read` |
| POST | `/properties` | Create property | `property:write` |
| GET | `/properties/:id` | Get by ID | `property:read` |
| PATCH | `/properties/:id` | Update | `property:write` |
| DELETE | `/properties/:id` | Soft delete | `property:delete` |
| GET | `/properties/search` | Full-text + filters | `property:read` |
| POST | `/properties/filter` | Structured filter (complex bodies) | `property:read` |
| GET | `/properties/:id/similar` | Similar properties | `property:read` |
| GET | `/properties/filter-options` | Communities/buildings for UI | `property:read` |
| GET | `/properties/:id/history/price` | Price history | `property:read` |
| GET | `/properties/:id/history/rental` | Rental history | `property:read` |
| GET | `/properties/:id/history/sale` | Sale history | `property:read` |
| GET | `/properties/:id/comparables` | Comparable set | `property:read` |
| GET | `/properties/:id/photos` | Photo gallery | `property:read` |
| POST | `/properties/:id/photos` | Upload photo metadata | `property:write` |
| GET | `/properties/:id/notes` | Internal notes | `property:read` |
| POST | `/properties/:id/notes` | Add note | `property:write` |

**Search/filter body (POST `/properties/filter`):**

```json
{
  "community_id": "uuid",
  "building_id": "uuid",
  "listing_type": "SALE",
  "property_type": "APARTMENT",
  "bedrooms": 2,
  "min_price": 1000000,
  "max_price": 3000000,
  "min_square_feet": 800,
  "max_square_feet": 2000,
  "furnishing": "FULLY_FURNISHED",
  "view": "SEA",
  "status": "ACTIVE"
}
```

---

### 5.2 Listings

| Method | Path | Description |
|---|---|---|
| GET | `/listings` | List |
| POST | `/listings` | Create |
| GET | `/listings/:id` | Get |
| PATCH | `/listings/:id` | Update |
| DELETE | `/listings/:id` | Withdraw / soft delete |
| GET | `/listings/search` | Search |
| POST | `/listings/filter` | Filter |
| POST | `/listings/:id/publish` | DRAFT → ACTIVE |
| POST | `/listings/:id/withdraw` | ACTIVE → WITHDRAWN |
| POST | `/listings/:id/mark-sold` | Close sale/rent |

---

### 5.3 Communities

| Method | Path | Description |
|---|---|---|
| GET | `/communities` | List (masters + projects) |
| POST | `/communities` | Create |
| GET | `/communities/:id` | Get |
| GET | `/communities/slug/:slug` | Get by slug |
| PATCH | `/communities/:id` | Update |
| DELETE | `/communities/:id` | Delete |
| GET | `/communities/search` | Search |
| POST | `/communities/filter` | Filter |
| GET | `/communities/:id/intelligence` | Intelligence profile sections |
| GET | `/communities/:id/buildings` | Buildings in community |
| GET | `/communities/:id/market-stats` | Market statistics |

---

### 5.4 Buildings

| Method | Path | Description |
|---|---|---|
| GET | `/buildings` | List |
| POST | `/buildings` | Create |
| GET | `/buildings/:id` | Get |
| PATCH | `/buildings/:id` | Update |
| DELETE | `/buildings/:id` | Delete |
| GET | `/buildings/search` | Search |
| POST | `/buildings/filter` | Filter |
| GET | `/buildings/community/:communityId` | By community |
| GET | `/buildings/:id/properties` | Properties in building |
| GET | `/buildings/:id/market-stats` | Building-level stats |

---

### 5.5 Agents

| Method | Path | Description |
|---|---|---|
| GET | `/agents` | List |
| POST | `/agents` | Create |
| GET | `/agents/:id` | Get |
| PATCH | `/agents/:id` | Update |
| DELETE | `/agents/:id` | Deactivate |
| GET | `/agents/search` | Search |
| POST | `/agents/filter` | Filter |
| GET | `/agents/:id/listings` | Active listings |
| GET | `/agents/:id/deals` | Pipeline |
| GET | `/agents/:id/performance` | KPIs |

---

### 5.6 Owners

| Method | Path | Description | Permission |
|---|---|---|---|
| GET | `/owners` | List | `owner:read` |
| POST | `/owners` | Create | `owner:write` |
| GET | `/owners/:id` | Get | `owner:read` |
| PATCH | `/owners/:id` | Update | `owner:write` |
| DELETE | `/owners/:id` | Delete | `owner:delete` |
| GET | `/owners/search` | Search | `owner:read` |
| GET | `/owners/:id/portfolio` | Property IDs | `owner:read` |

---

### 5.7 Buyers

| Method | Path | Description |
|---|---|---|
| GET | `/buyers` | List |
| POST | `/buyers` | Create |
| GET | `/buyers/:id` | Get |
| PATCH | `/buyers/:id` | Update |
| DELETE | `/buyers/:id` | Delete |
| GET | `/buyers/search` | Search |
| POST | `/buyers/filter` | Filter |

---

### 5.8 Tenants

Same CRUD pattern as Buyers at `/tenants`.

---

### 5.9 Deals

| Method | Path | Description |
|---|---|---|
| GET | `/deals` | List |
| POST | `/deals` | Create |
| GET | `/deals/:id` | Get |
| PATCH | `/deals/:id` | Update |
| DELETE | `/deals/:id` | Cancel |
| GET | `/deals/search` | Search |
| POST | `/deals/filter` | Filter |
| GET | `/deals/pipeline` | Count by status |
| POST | `/deals/:id/advance` | Status transition |
| GET | `/deals/:id/commission` | Commission record |

---

### 5.10 Viewings

| Method | Path | Description |
|---|---|---|
| GET | `/viewings` | List |
| POST | `/viewings` | Schedule |
| GET | `/viewings/:id` | Get |
| PATCH | `/viewings/:id` | Update |
| DELETE | `/viewings/:id` | Cancel |
| GET | `/viewings/search` | Search |
| POST | `/viewings/filter` | Filter |
| GET | `/viewings/upcoming` | Upcoming (optional `agent_id`) |
| GET | `/viewings/today` | Today's viewings |
| GET | `/viewings/calendar` | `?from=&to=` date range |

---

### 5.11 Market Intelligence

| Method | Path | Description |
|---|---|---|
| POST | `/market/analyze` | Run market analysis for filter scope |
| GET | `/market/statistics` | Pre-computed stats by scope |
| GET | `/market/comparables` | Comparables for scope |
| POST | `/market/reports/pricing` | Generate pricing report (PDF URL) |

**POST `/market/analyze` body:** Same filter shape as property intelligence scope.

---

### 5.12 Property Intelligence

| Method | Path | Description |
|---|---|---|
| POST | `/intelligence/report` | Full intelligence report |
| GET | `/intelligence/confidence` | Market confidence for scope |
| POST | `/intelligence/reports/pdf` | PDF generation job |
| POST | `/intelligence/ai/ask` | AI copilot query (Phase 4) |

---

### 5.13 Tasks (CRM)

| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List |
| POST | `/tasks` | Create |
| GET | `/tasks/:id` | Get |
| PATCH | `/tasks/:id` | Update |
| DELETE | `/tasks/:id` | Delete |
| GET | `/tasks/daily` | Due today |
| GET | `/tasks/overdue` | Overdue |
| GET | `/tasks/recurring` | Recurring definitions |
| POST | `/tasks/:id/complete` | Mark complete |

---

### 5.14 Leads (CRM — Phase 2.5)

| Method | Path | Description |
|---|---|---|
| GET | `/leads` | List by stage |
| POST | `/leads` | Create |
| PATCH | `/leads/:id` | Update |
| POST | `/leads/:id/advance` | Move kanban stage |
| GET | `/leads/pipeline` | Count by stage |

---

### 5.15 Commissions

| Method | Path | Description |
|---|---|---|
| GET | `/commissions` | List |
| GET | `/commissions/:id` | Get |
| PATCH | `/commissions/:id` | Update status |
| GET | `/commissions/summary` | Period rollup |

---

### 5.16 Users, Roles, Permissions (Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List users |
| GET | `/users/me` | Current user + roles |
| PATCH | `/users/:id/roles` | Assign roles |
| GET | `/roles` | List roles |
| GET | `/permissions` | List permissions |

---

## 6. Bulk operations

### 6.1 Bulk update

```
PATCH /api/v1/properties/bulk
```

```json
{
  "ids": ["uuid", "uuid"],
  "updates": { "status": "OFF_MARKET" }
}
```

**Limits:** Max 500 IDs per request. Returns `{ "updated": 498, "failed": [{ "id": "...", "error": "..." }] }`.

Supported resources: properties, listings, tasks, leads.

---

### 6.2 Import

```
POST /api/v1/import/jobs
```

```json
{
  "resource": "properties",
  "format": "csv",
  "file_url": "s3://bucket/import.csv",
  "mapping": { "Property Code": "property_code" },
  "mode": "upsert"
}
```

**Response:** `{ "job_id": "uuid", "status": "queued" }`

```
GET /api/v1/import/jobs/:id
```

Returns progress, errors, row counts.

**Limits:** Max 10,000 rows per job; large jobs chunked by worker.

---

### 6.3 Export

```
POST /api/v1/export/jobs
```

```json
{
  "resource": "listings",
  "format": "csv",
  "filter": { "status": "ACTIVE", "listing_type": "SALE" },
  "fields": ["id", "list_price", "property_code"]
}
```

```
GET /api/v1/export/jobs/:id
```

Returns `{ "status": "complete", "download_url": "..." }` (signed URL, 1h expiry).

---

## 7. Salesforce integration (Phase 3)

| Method | Path | Description |
|---|---|---|
| POST | `/integrations/salesforce/webhook` | Inbound SFDC events |
| POST | `/integrations/salesforce/sync` | Trigger manual sync |
| GET | `/integrations/salesforce/status` | Last sync, errors |
| GET | `/integrations/salesforce/mappings` | Field mappings |
| PUT | `/integrations/salesforce/mappings` | Update mappings |

---

## 8. Webhooks (outbound — Phase 5)

LARSSH can notify external systems:

```
POST {customer_url}
X-Paragon-Signature: sha256=...
```

Events: `listing.published`, `deal.closed`, `viewing.completed`, `import.finished`.

---

## 9. Rate limits

| Tier | Limit |
|---|---|
| Standard API | 1,000 requests / minute / user |
| Search | 120 requests / minute / user |
| Export / Import | 10 jobs / hour / org |
| AI Copilot | 60 requests / hour / user (Phase 4) |

Headers on response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1625097600
```

---

## 10. Implementation mapping

| Contract location | Runtime location (Phase 2) |
|---|---|
| `src/api/resources/*.api.ts` | Handler interfaces |
| `src/api/routes.ts` | Route constants |
| `src/app/api/v1/**/route.ts` | Next.js Route Handlers |
| `src/services/*.service.ts` | Business logic |
| `src/repositories/*.repository.ts` | Data access |

**Existing code:** Interfaces defined in Phase 2 architecture. Route handlers not yet implemented — **no UI impact**.

---

## 11. OpenAPI

Phase 2 deliverable: `docs/openapi/paragonos-v1.yaml` generated from TypeScript interfaces (tooling Phase 2.6).

---

*LARSSH API Design v1.0 — REST foundation for 100k+ scale*
