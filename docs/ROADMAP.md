# LARSSH — Product Roadmap

**Version:** 1.0  
**Horizon:** 18–24 months  
**Principle:** Foundation before features; API before mobile; data before AI

---

## Overview

LARSSH delivery follows six phases. Each phase has explicit exit criteria. **UI screens are largely complete from Phase 1** — subsequent phases wire data, integrations, and scale infrastructure without redesigning the interface.

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
Foundation   Database    Salesforce    AI          Analytics    Mobile
  ✅            🔶           ○            ○             ○            ○
```

**Legend:** ✅ Complete · 🔶 In progress · ○ Planned

---

## Phase 1 — Foundation

**Status:** ✅ Complete  
**Duration:** Completed  
**Goal:** Establish UI shell, feature modules, design system, and architectural contracts.

### Deliverables

| Area | Deliverable | Status |
|---|---|---|
| **UI shell** | ParagonShell, sidebar, dark/gold design system | ✅ |
| **Core pages** | Intelligence, Market, CRM, Search, Communities, Dashboard | ✅ |
| **Auth** | Supabase email/password, middleware guards | ✅ |
| **Design tokens** | Tailwind v4, shadcn/ui primitives | ✅ |
| **Feature modules** | 14 bounded contexts with README standards | ✅ |
| **Architecture contracts** | `src/types`, `repositories`, `services`, `api` interfaces | ✅ |
| **Prisma schema v0** | 11 core models, migration, seed | ✅ |
| **Documentation** | Phase 2 architecture doc | ✅ |

### Exit criteria

- [x] All primary routes render without database (UI-only mode)
- [x] Feature-first folder structure documented
- [x] Repository and service interfaces defined for 10 entities
- [x] No business logic in React components beyond presentation

### Technical debt accepted

- Mock data in intelligence, market, CRM, communities, dashboard
- Legacy Prisma property repository outside interface pattern
- No RBAC, no REST API routes, Profile not linked to Supabase user

---

## Phase 2 — Database

**Status:** 🔶 In progress  
**Duration:** 8–12 weeks  
**Goal:** Production-grade PostgreSQL schema, repository implementations, service layer, and wire existing UI to live data at 100k-property scale.

### Deliverables

| Workstream | Deliverables |
|---|---|
| **Schema expansion** | Full schema per DATABASE_DESIGN.md: history tables, media, RBAC, tasks, commissions, market stats, comparables, holiday homes |
| **Migrations** | Zero-downtime migration strategy; backfill scripts |
| **Search index** | `property_search_index` materialized/denormalized table or OpenSearch |
| **Repositories** | Prisma implementations of all 10 `I*Repository` interfaces |
| **Services** | Concrete `IServiceRegistry`; `ServiceResult` error mapping |
| **Feature wiring** | Search, Properties, Communities → live data (no UI changes) |
| **Auth sync** | Supabase user → Profile → Role on sign-up |
| **RBAC** | Roles, Permissions, middleware + service-level checks |
| **REST API v1** | Implement `src/app/api/v1/**` per API_DESIGN.md |
| **Media pipeline** | S3 upload, CDN URLs for photos/videos/floor plans |
| **Observability** | Structured logging, query timing, health endpoints |

### Milestones

| # | Milestone | Target |
|---|---|---|
| 2.1 | Expanded schema migrated to staging | Week 2 |
| 2.2 | Property + Listing repos + search index | Week 4 |
| 2.3 | Search + Property pages on new service layer | Week 6 |
| 2.4 | Communities + Buildings + Market Statistics | Week 8 |
| 2.5 | CRM entities (Deals, Viewings, Tasks) live | Week 10 |
| 2.6 | REST API v1 GA on staging | Week 12 |

### Exit criteria

- [ ] 100k property seed performance test: search P95 < 300ms
- [ ] All CRUD operations pass integration tests per entity
- [ ] Zero direct Prisma imports in feature components
- [ ] Owner PII gated by permission checks
- [ ] Legacy `lib/repositories/property.repository.ts` retired

### Scale decisions (Phase 2)

- Partition `price_history` and `listing_events` by year
- Read replica for search and analytics queries
- Background workers for index refresh and market stat aggregation

---

## Phase 3 — Salesforce

**Status:** ○ Planned  
**Duration:** 6–8 weeks  
**Goal:** Bidirectional CRM sync for brokerages on Salesforce.

### Deliverables

| Deliverable | Description |
|---|---|
| **Integration adapter** | `features/salesforce/` sync engine |
| **Field mapping UI** | Settings → Salesforce mapping configuration |
| **Entity sync** | Leads ↔ Buyers, Opportunities ↔ Deals, Activities ↔ Viewings/Tasks |
| **Conflict policy** | LARSSH wins on property/listing; SFDC wins on enterprise lead source |
| **Webhook receiver** | `/api/v1/integrations/salesforce/webhook` |
| **Sync jobs** | Scheduled full sync + incremental delta |
| **Audit log** | Sync events, failures, manual resolution queue |

### Exit criteria

- [ ] Bi-directional sync verified on staging with SFDC sandbox
- [ ] No duplicate deals on conflict
- [ ] Sync lag < 5 minutes for incremental updates

---

## Phase 4 — AI

**Status:** ○ Planned  
**Duration:** 6–10 weeks  
**Goal:** Production AI Copilot grounded in LARSSH data.

### Deliverables

| Deliverable | Description |
|---|---|
| **LLM provider integration** | OpenAI / Anthropic via abstraction layer |
| **RAG pipeline** | Property scope + comparables + market stats as context |
| **AI service** | `IAiCopilotService` with prompt templates and guardrails |
| **Ask AI panel** | Replace mock responses in Property Intelligence |
| **Suggested actions** | List price, negotiation strategy, time-to-sell |
| **Query audit** | Log prompts and responses for compliance |
| **Rate limiting** | Per-user and per-org quotas |

### Exit criteria

- [ ] AI responses cite comparables from live data
- [ ] P95 response time < 8s streaming
- [ ] No owner PII in AI context without permission
- [ ] Evaluation suite for pricing accuracy vs analyst baseline

---

## Phase 5 — Analytics

**Status:** ○ Planned  
**Duration:** 8–12 weeks  
**Goal:** Enterprise analytics, scheduled reports, and portfolio intelligence.

### Deliverables

| Deliverable | Description |
|---|---|
| **Analytics module** | `features/analytics/` wired to warehouse |
| **Data warehouse** | BigQuery or Snowflake sync from PostgreSQL |
| **Materialized dashboards** | Pre-computed KPIs for Dashboard module |
| **Reports hub** | Dedicated reports page; scheduled email delivery |
| **Market trend engine** | Automated market statistics refresh |
| **Holiday home scoring** | Model for vacation rental investment score |
| **Multi-branch** | Org/branch hierarchy in analytics roll-ups |
| **Export API** | Bulk CSV/Excel export per API_DESIGN.md |

### Exit criteria

- [ ] Dashboard loads from aggregates in < 500ms
- [ ] Weekly market reports generated automatically
- [ ] Branch-level and org-level views for managing broker

---

## Phase 6 — Mobile App

**Status:** ○ Planned  
**Duration:** 12–16 weeks  
**Goal:** Native mobile experience for agents in the field.

### Deliverables

| Deliverable | Description |
|---|---|
| **API completeness** | Mobile-optimized endpoints (lighter payloads) |
| **React Native or Flutter app** | Search, property detail, viewings calendar, CRM tasks |
| **Offline mode** | Cached recents and viewing schedule |
| **Push notifications** | Viewing reminders, deal stage changes |
| **Camera upload** | Property photos from mobile → media pipeline |
| **Biometric auth** | Face ID / fingerprint via Supabase session |

### Exit criteria

- [ ] Feature parity for Search, Viewings, CRM tasks on iOS + Android
- [ ] App Store / Play Store internal distribution
- [ ] All data via REST API v1 — no direct DB access from mobile

---

## Cross-phase dependencies

```
Phase 2 (Database) ──required──► Phase 3 (Salesforce)
                                ──► Phase 4 (AI)
                                ──► Phase 5 (Analytics)
                                ──► Phase 6 (Mobile)

Phase 4 (AI) ──enhances──► Property Intelligence, Market Intelligence
Phase 5 (Analytics) ──enhances──► Dashboard, Reports
```

---

## Risk register

| Risk | Mitigation |
|---|---|
| Search slow at 100k rows | Denormalized index + OpenSearch fallback |
| CRM mock ≠ DB model | Lead entity decision in Phase 2.5 |
| Salesforce schema drift | Versioned field mapping + integration tests |
| AI hallucinated prices | Grounding + mandatory comparable citations |
| Mobile scope creep | API-first; mobile consumes v1 only |

---

## Team allocation (recommended)

| Phase | Backend | Frontend | Data | DevOps |
|---|---|---|---|---|
| 1 Foundation | 1 | 2 | — | — |
| 2 Database | 3 | 1 | 1 | 1 |
| 3 Salesforce | 2 | 0.5 | — | — |
| 4 AI | 2 | 0.5 | 1 | — |
| 5 Analytics | 2 | 1 | 2 | 1 |
| 6 Mobile | 1 | 2 mobile | — | 0.5 |

---

*LARSSH Roadmap v1.0 — CTO Office*
