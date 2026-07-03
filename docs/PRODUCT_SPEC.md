# LARSSH — Product Specification

**Version:** 1.0  
**Status:** Foundation / Phase 2  
**Audience:** Product, Engineering, Leadership  
**Classification:** Internal — Real Estate Brokerage Operating System

---

## 1. Vision

**LARSSH** is the internal operating system for a real estate brokerage. It unifies property intelligence, market analytics, transaction pipeline, and advisory workflows into a single platform designed to manage **100,000+ properties** across master communities, buildings, and listings.

LARSSH is **not** a generic CRM. It is a **Property Intelligence Platform** with CRM capabilities embedded where transactions require them.

### Core principles

| Principle | Meaning |
|---|---|
| **Intelligence first** | Pricing, comparables, and market confidence drive decisions before pipeline management |
| **Single source of truth** | Properties, listings, and people entities are authoritative; UI is a projection |
| **Brokerage-grade security** | Role-based access; owner PII restricted; audit on sensitive reads |
| **Scale by design** | Search, stats, and media served from indexed/read-optimized paths |
| **Integration-ready** | Salesforce, AI, and mobile consume the same API layer |

---

## 2. Personas

| Persona | Primary modules | Goals |
|---|---|---|
| **Managing Broker** | Dashboard, Reports, Market Intelligence | Portfolio performance, team KPIs, market posture |
| **Senior Agent** | Search, Property Intelligence, CRM, Viewings | Price accurately, close faster, manage pipeline |
| **Junior Agent** | Search, Communities, Viewings | Discover inventory, schedule viewings, follow tasks |
| **Analyst / Research** | Market Intelligence, Reports, Comparables | Benchmark pricing, produce advisory reports |
| **Operations** | Import/Export, Settings, Documents | Data quality, bulk updates, compliance |
| **Admin** | Users, Roles, Permissions, Settings | Access control, integrations, org configuration |

---

## 3. Module catalog

Each module maps to a **feature bounded context** under `src/features/` and a **domain service** under `src/services/`. UI routes exist today for most modules; data wiring is phased per ROADMAP.

---

### 3.1 Dashboard

**Purpose:** Executive snapshot of brokerage activity and market health.

**Capabilities:**
- Portfolio KPIs: active listings, new inventory, deals in pipeline, revenue, commission
- Market pulse: absorption, average days on market, price movement
- Team performance: calls, viewings, offers, closes by agent
- Recent activity feed: listing updates, deal stage changes, viewing outcomes
- Quick actions: jump to Search, Intelligence, CRM

**Data sources:** Aggregated queries across Listings, Deals, Viewings, Market Statistics.

**Current state:** UI complete with mock data (`/dashboard`).

**Scale note:** Dashboard reads from materialized aggregates refreshed every 5–15 minutes, not live scans across 100k properties.

---

### 3.2 Search

**Purpose:** Primary inventory discovery for agents — filter, sort, and open property records.

**Capabilities:**
- Full-text and structured filter: community, building, type, beds, baths, price, purpose, furnishing, view, size
- Enterprise results table with price position badges (under market / market / overpriced)
- Property detail drawer and deep link to full property page
- Saved searches (future)

**Data sources:** Property + Listing search index; comparables for difference %.

**Current state:** UI complete; partial PostgreSQL via legacy property repository (`/search`).

**Scale note:** Dedicated `property_search_index` table or OpenSearch cluster for sub-200ms queries at 100k+ rows.

---

### 3.3 Communities

**Purpose:** Navigate master-planned communities and residential projects with intelligence profiles.

**Capabilities:**
- Master community hierarchy (e.g. Al Hamra Village → Pacific)
- Community intelligence: overview, buildings, unit types, market trends, lifestyle, nearby POIs
- Link communities to canonical `communities` table records

**Data sources:** Communities, Buildings, Market Statistics, Amenities.

**Current state:** UI complete with mock registry (`/communities`).

---

### 3.4 Buildings

**Purpose:** Physical structure inventory within communities — towers, phases, podiums.

**Capabilities:**
- Building profile: floors, year built, unit count, address
- Units roll-up: property count by type and status
- Building-level market stats

**Data sources:** Buildings, Properties, Market Statistics.

**Current state:** Embedded in Search and Communities; no standalone page (by design — accessed via community/property context).

---

### 3.5 Properties

**Purpose:** Canonical inventory unit — the atomic asset the brokerage advises on.

**Capabilities:**
- Property record: building, owner, specs (beds, baths, sqft, type, furnishing, view, status)
- Media gallery: photos, videos, floor plans
- Documents and internal notes
- Price/rental/sale history timeline
- Link to active listings and comparables

**Data sources:** Properties, Owners, Photos, Documents, Price History, Amenities.

**Current state:** Detail page UI complete; partial PostgreSQL (`/properties/[id]`).

**Scale note:** Property core row stays lean; media and history in child tables with CDN-backed URLs.

---

### 3.6 Owners

**Purpose:** Property ownership records with restricted visibility.

**Capabilities:**
- Owner profile and contact (role-gated)
- Portfolio: all properties owned
- Communication notes (internal only)
- Consent flags for marketing and data sharing

**Data sources:** Owners, Properties, Notes.

**Current state:** Schema + seed; no public UI (restricted module).

**Security:** Owner PII visible only to assigned agents and admin roles.

---

### 3.7 Agents

**Purpose:** Licensed brokerage professionals — listing assignment, deals, viewings.

**Capabilities:**
- Agent profile: license, agency, contact
- Active listings and pipeline summary
- Performance metrics: closes, commission, activity
- Calendar integration for viewings (future)

**Data sources:** Agents, Listings, Deals, Viewings, Commissions.

**Current state:** Placeholder page; agents seeded in DB.

---

### 3.8 Buyers

**Purpose:** Purchase-side clients in deal and viewing workflows.

**Capabilities:**
- Buyer profile and preferences (budget, area, beds)
- Linked deals and viewings
- CRM lead conversion (future)

**Data sources:** Buyers, Deals, Viewings.

**Current state:** Schema only; surfaced in CRM mock as leads/clients.

---

### 3.9 Tenants

**Purpose:** Rental-side clients for rent listings and viewings.

**Capabilities:**
- Tenant profile
- Viewing history on rent listings
- Lease pipeline (future)

**Data sources:** Tenants, Viewings, Listings (RENT type).

**Current state:** Schema only.

---

### 3.10 Deals

**Purpose:** Transaction pipeline from inquiry through close.

**Capabilities:**
- Deal stages: inquiry → viewing → offer → negotiation → contract → transfer → closed
- Offer and agreed price tracking
- Linked listing, buyer, agent
- Commission calculation on close

**Data sources:** Deals, Listings, Buyers, Agents, Commissions.

**Current state:** CRM UI with mock pipeline (`/crm` → Deals tab).

---

### 3.11 Viewings

**Purpose:** Scheduled property visits with notes and outcomes.

**Capabilities:**
- Calendar, upcoming, today, past views
- Viewing notes and status (scheduled, confirmed, completed, no-show)
- Link to listing, agent, buyer/tenant

**Data sources:** Viewings, Listings, Agents.

**Current state:** CRM UI with mock data (`/crm` → Viewings tab).

---

### 3.12 Market Intelligence

**Purpose:** Market-scope analytics — pricing benchmarks, trends, distribution, comparables.

**Capabilities:**
- Cascading filters: master community → community → building → product attributes
- Market summary KPIs, price distribution, rental/sales trends
- Market score badges and comparable listings table
- Printable pricing report

**Data sources:** Market Statistics, Comparables, Listings, Price History.

**Current state:** UI complete with mock analytics (`/market`).

---

### 3.13 Property Intelligence

**Purpose:** Bloomberg-grade advisory terminal for a scoped property segment.

**Capabilities:**
- Intelligence search with 11+ filters
- Full intelligence report: estimated value, suggested list/close prices, ROI, scores, supply/demand
- Market confidence gauge
- Comparable listings, PDF report, AI copilot panel (mock)

**Data sources:** Market Statistics, Comparables, Listings, Properties, AI Copilot (Phase 4).

**Current state:** UI complete with mock engine (`/intelligence`).

---

### 3.14 CRM

**Purpose:** Operational pipeline for leads, viewings, tasks, and deals — HubSpot/Salesforce velocity without replacing intelligence modules.

**Capabilities:**
- Leads kanban: new → contacted → viewing → negotiating → won/lost
- Viewings calendar and lists
- Tasks: daily, overdue, completed, recurring
- Deals pipeline with value and commission preview
- Activity stats: calls, viewings, offers, revenue

**Data sources:** Leads (future entity), Viewings, Deals, Tasks, Agents.

**Current state:** UI complete with mock data (`/crm`).

**Note:** CRM `Lead` is a UI/workflow entity today; Phase 3 aligns or maps to Buyers + activity records.

---

### 3.15 AI Copilot

**Purpose:** Natural-language advisory on pricing, comparables, negotiation, and time-to-sell.

**Capabilities:**
- Guided questions and free-form chat
- Context-aware responses scoped to current property/market filters
- Suggested listing price, overpriced analysis, negotiation strategy
- Audit log of AI queries (compliance)

**Data sources:** Property Intelligence report, Comparables, Market Statistics; LLM provider (Phase 4).

**Current state:** Mock panel in Property Intelligence (`Ask AI` side sheet).

---

### 3.16 Reports

**Purpose:** Exportable brokerage and market reports for clients and leadership.

**Capabilities:**
- Pricing intelligence PDF (exists in Market + Property Intelligence)
- Portfolio performance reports
- Agent activity reports
- Market trend reports by community
- Scheduled report delivery (future)

**Data sources:** All analytics modules; report templates stored in Documents.

**Current state:** PDF preview in intelligence modules; no dedicated Reports hub yet.

---

### 3.17 Salesforce Integration

**Purpose:** Bidirectional sync with Salesforce CRM for enterprises already on SFDC.

**Capabilities:**
- Sync: Leads, Contacts, Opportunities, Activities
- Field mapping configuration
- Conflict resolution (LARSSH authoritative for property data; SFDC for enterprise CRM)
- Webhook + polling hybrid

**Data sources:** Salesforce API; mapping layer in `features/salesforce/`.

**Current state:** README placeholder only (Phase 3).

---

### 3.18 Settings

**Purpose:** Organization, user, integration, and platform configuration.

**Capabilities:**
- User profile and notification preferences
- Role assignment (via Admin)
- Integration credentials (Salesforce, AI provider)
- Default market scope and currency
- Import/export job configuration

**Data sources:** Users, Roles, Permissions, org settings table (future).

**Current state:** Placeholder page (`/settings`).

---

## 4. Non-functional requirements

| Requirement | Target |
|---|---|
| **Property inventory** | 100,000+ properties, 200,000+ listings (historical) |
| **Search latency** | P95 < 300ms on filtered search |
| **Intelligence report** | P95 < 2s for scoped analytics |
| **Availability** | 99.9% uptime (business hours critical) |
| **Auth** | Supabase Auth → Profile → Role → Permission |
| **Audit** | Sensitive reads and exports logged |
| **Media** | S3-compatible object storage + CDN |
| **Multi-branch** | Org → Branch → Agent hierarchy (Phase 5+) |

---

## 5. Out of scope (v1 foundation)

- Public consumer portal / MLS syndication
- Payment processing / escrow
- Legal document e-sign (integration hook only)
- Native mobile apps (Phase 6 — API-first enables this)

---

## 6. Module dependency graph

```
Communities ──► Buildings ──► Properties ──► Listings
                                  │              │
Owners ◄──────────────────────────┘              ├──► Deals ──► Commissions
Agents ◄─────────────────────────────────────────┤
Buyers / Tenants ◄───────────────────────────────├──► Viewings
                                                  │
Market Statistics / Comparables ◄────────────────┘
         │
         ├──► Market Intelligence
         ├──► Property Intelligence ──► AI Copilot
         └──► Reports

CRM ◄── Viewings, Deals, Tasks, Leads
Search ◄── Properties, Listings, Comparables
Dashboard ◄── Aggregates across all
Salesforce ◄── Sync layer on CRM + People entities
```

---

## 7. Success metrics

| Metric | Definition |
|---|---|
| **Time to price** | Minutes from property scope to intelligence report |
| **Search adoption** | Daily active agents using Search |
| **Report generation** | PDF reports generated per week |
| **Pipeline velocity** | Average days from lead to closed deal |
| **Data freshness** | Max lag between listing change and search index update |

---

*LARSSH Product Spec v1.0 — Internal brokerage operating system*
