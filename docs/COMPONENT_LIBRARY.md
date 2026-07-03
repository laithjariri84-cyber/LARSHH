# LARSSH — Component Library

**Version:** 1.0  
**Stack:** React 19 · Next.js 15 · Tailwind CSS v4 · shadcn/ui (new-york) · Radix UI · Lucide icons  
**Theme:** LARSSH dark shell with gold accent (`#D4AF37`)

---

## 1. Design system foundations

### 1.1 Design tokens

Defined in `src/app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--gold` | `#D4AF37` | Primary accent, active nav, KPI highlights |
| `--gold-muted` | `rgba(212,175,55,0.12)` | Subtle backgrounds, badges |
| `--gold-foreground` | `#0A0A0B` | Text on gold buttons |
| `--background` | `#09090B` | App background |
| `--card` | `#111113` | Card surfaces |
| `--sidebar` | `#0C0C0E` | Sidebar shell |
| `--radius` | `0.75rem` | Base border radius |

### 1.2 Utility classes

| Class | Purpose |
|---|---|
| `.paragon-card` | Standard elevated card: blur, inset border, shadow |
| `.paragon-gold-gradient` | Gold gradient fill for icons and primary CTAs |
| `.intelligence-terminal` | Grid background for Bloomberg-style panels |
| `.intelligence-ticker` | Tabular nums for financial data |
| `.animate-fade-in` | Entry animation |
| `.animate-slide-up` | Staggered section reveal |

### 1.3 Typography

- **Sans:** Geist Sans (`--font-geist-sans`) — UI copy, headings
- **Mono:** Geist Mono — prices, codes, timestamps in intelligence modules

### 1.4 Iconography

**Library:** Lucide React — 16px (`size-4`) in nav; 20px in section headers.

**Semantic colors:**
- Gold — primary / active
- Emerald — positive / under market / active status
- Red — overpriced / overdue / high priority
- Sky — rent / informational
- Amber — medium priority / pending

---

## 2. Primitive components (`src/components/ui/`)

shadcn/ui-style primitives. **Do not modify for feature-specific logic** — compose in feature components.

### 2.1 Button

**Path:** `src/components/ui/button.tsx`  
**Base:** Radix Slot + class-variance-authority

| Variant | Usage |
|---|---|
| `default` | Primary actions |
| `outline` | Secondary actions, filter chips |
| `ghost` | Tertiary, nav-adjacent |
| `destructive` | Delete confirmations |

**Paragon pattern:** Gold CTA via `className="paragon-gold-gradient text-gold-foreground"`.

**Used in:** Report generation, Ask AI, CRM actions, login.

---

### 2.2 Input

**Path:** `src/components/ui/input.tsx`

**Variants in use:**
- Standard height `h-10` / `h-11` — forms, filters
- Large `h-12` / `h-14` — intelligence search bars

**Styling pattern:** `border-white/10 bg-card/70 backdrop-blur-md focus-visible:border-gold/40`

---

### 2.3 Label

**Path:** `src/components/ui/label.tsx`  
**Usage:** Filter panel field labels — `text-[11px] tracking-wider uppercase`

---

### 2.4 Select

**Path:** `src/components/ui/select.tsx`  
**Base:** Radix Select

**Usage:** All cascading filter dropdowns (Market Intelligence, Property Intelligence, Search filters, CRM filters).

**Pattern:** `SelectTrigger` height `h-10`/`h-11`; gold border when value selected.

---

### 2.5 Card

**Path:** `src/components/ui/card.tsx`  
**Usage:** Base card primitive; most UI uses `.paragon-card` utility instead for Paragon styling.

---

### 2.6 Badge

**Path:** `src/components/ui/badge.tsx`

| Pattern | Example |
|---|---|
| Status | Active, Pending, Sold |
| Price position | Under Market (green), Market Price (blue), Overpriced (red) |
| Priority | High, Medium, Low (CRM) |
| Module tags | LIVE PREVIEW, Property Intelligence Platform |

---

### 2.7 Table

**Path:** `src/components/ui/table.tsx`

**Usage:**
- Search listings enterprise table
- CRM comparables (intelligence modules)
- Comparable listings across market/property intelligence

**Pattern:** `border-white/5` rows; hover `bg-gold/[0.04]`; horizontal scroll wrapper.

---

### 2.8 Dialog

**Path:** `src/components/ui/dialog.tsx`  
**Base:** Radix Dialog

**Usage:** PDF report preview modals (Market Intelligence, Property Intelligence).

**Features:** Print/Save PDF action in header; `max-w-5xl` for report preview.

---

### 2.9 Sheet

**Path:** `src/components/ui/sheet.tsx`  
**Base:** Radix Dialog (slide variant)

**Usage:**
- Property details drawer (Search) — right side
- AI Copilot panel (Property Intelligence) — right side

**Sides:** `right` default; full width mobile, `sm:max-w-xl` desktop.

---

### 2.10 Dropdown Menu

**Path:** `src/components/ui/dropdown-menu.tsx`  
**Usage:** User nav avatar menu (profile stub, settings, sign out).

---

### 2.11 Separator

**Path:** `src/components/ui/separator.tsx`  
**Usage:** Section dividers in drawers and intelligence panels.

---

### 2.12 Skeleton

**Path:** `src/components/ui/skeleton.tsx`  
**Usage:** Search page loading state (`search/loading.tsx`).

---

## 3. Layout components (`src/components/layout/`)

### 3.1 ParagonShell

**Path:** `src/components/layout/paragon-shell.tsx`

**Composition:**
- Collapsible sidebar (desktop)
- Mobile drawer overlay
- Top bar: menu toggle, notifications bell, user avatar block
- Main content area

**State:** Sidebar collapse persisted in `localStorage`.

---

### 3.2 ParagonSidebar

**Path:** `src/components/layout/paragon-sidebar.tsx`

**Nav items:** Property Intelligence, Market Intelligence, CRM, Dashboard, Search, Communities, Agents, Favorites, Settings.

**Active state:** Gold muted background + gold text. Featured items get gold border when inactive.

---

### 3.3 DashboardNavbar

**Path:** `src/components/layout/dashboard-navbar.tsx`  
**Usage:** Legacy page header with title and count badge. Superseded by in-page headers in newer modules.

---

### 3.4 UserNav

**Path:** `src/components/layout/user-nav.tsx`  
**Usage:** Avatar dropdown with Supabase sign-out.

---

### 3.5 AppSidebar

**Path:** `src/components/layout/app-sidebar.tsx`  
**Status:** Legacy minimal sidebar — retained for reference; ParagonSidebar is canonical.

---

## 4. Auth components

### 4.1 LoginForm

**Path:** `src/components/auth/login-form.tsx`  
**Usage:** Email/password authentication via Supabase client.

---

## 5. Feature-composed components (by category)

These live under `src/features/*/components/`. Documented here as the **LARSSH component catalog** — reusable patterns for future modules.

---

### 5.1 Cards

| Component | Module | Path | Purpose |
|---|---|---|---|
| **Stat card** | Dashboard, CRM | `features/dashboard/components/stat-cards.tsx`, `features/crm/components/crm-stats-cards.tsx` | KPI with icon, value, trend badge |
| **Market overview card** | Dashboard | `features/dashboard/components/market-overview.tsx` | Metric + subtitle + trend |
| **Lead card** | CRM | `features/crm/components/leads/lead-card.tsx` | Kanban card: client, budget, agent, follow-up |
| **Deal card** | CRM | `features/crm/components/deals/deal-card.tsx` | Pipeline card: value, commission, close date |
| **Viewing card** | CRM | `features/crm/components/viewings/viewing-card.tsx` | Viewing with notes block |
| **Residential project card** | Communities | `features/communities/components/residential-project-card.tsx` | Project tile with ROI preview |
| **Master community card** | Communities | `features/communities/components/master-community-card.tsx` | Expandable hierarchy card |
| **Property card** | Search | `features/search/components/property-card.tsx` | Grid card variant (legacy) |
| **Terminal metric** | Property Intelligence | `features/property-intelligence/components/terminal-metric.tsx` | Bloomberg-style metric cell |
| **Intelligence section card** | Communities | `features/communities/components/intelligence-section.tsx` | Section wrapper with icon header |
| **Market section card** | Market Intelligence | `features/market-intelligence/components/market-section.tsx` | Section with gold accent bar |

**Card composition pattern:**
```
.paragon-card.rounded-2xl.p-5
  ├── Icon badge (gold-muted circle)
  ├── Label (uppercase tracking)
  ├── Value (text-2xl font-semibold or font-mono)
  └── Hint / trend / badge row
```

---

### 5.2 Charts

| Component | Module | Type | Path |
|---|---|---|---|
| **ListingTrendChart** | Dashboard | SVG line + area fill | `features/dashboard/components/dashboard-charts.tsx` |
| **MarketMixChart** | Dashboard | Donut / conic gradient | same |
| **PriceIndexChart** | Dashboard | Bar chart | same |
| **PriceDistributionChart** | Market Intelligence | Histogram bars | `features/market-intelligence/components/price-distribution-chart.tsx` |
| **MarketTrendChart** | Market Intelligence | 12-month line (gold/sky) | `features/market-intelligence/components/market-trend-chart.tsx` |
| **MarketConfidenceGauge** | Property Intelligence | Circular progress | `features/property-intelligence/components/market-confidence-gauge.tsx` |

**Chart guidelines:**
- SVG for dashboard and intelligence (no chart library dependency today)
- Phase 5: consider Recharts or Visx for analytics module complexity
- Gold (`#D4AF37`) for sale/primary; Sky (`#38BDF8`) for rent secondary

---

### 5.3 Tables

| Component | Module | Columns highlight | Path |
|---|---|---|---|
| **ListingsEnterpriseTable** | Search | Image, code, community, price, ROI badges | `features/search/components/listings-enterprise-table.tsx` |
| **ComparableListingsTable** | Market Intel | Building, size, price/sqft, diff % | `features/market-intelligence/components/comparable-listings-table.tsx` |
| **IntelligenceComparablesTable** | Property Intel | Same + mono typography | `features/property-intelligence/components/intelligence-comparables-table.tsx` |
| **ComparableListingsTable** | CRM | — | `features/crm/components/` (deals context) |
| **RecentListingsTable** | Dashboard | Community, unit, price, agent | `features/dashboard/components/recent-listings-table.tsx` |

**Table patterns:**
- Sticky header on scroll (future)
- Row click → drawer or navigate
- Status badges in last column
- Price difference color: emerald (negative), red (positive)

---

### 5.4 Forms & filters

| Component | Module | Path |
|---|---|---|
| **ListingsSearchFiltersPanel** | Search | `features/search/components/listings-search-filters-panel.tsx` |
| **MarketFilterCascade** | Market Intelligence | `features/market-intelligence/components/market-filter-cascade.tsx` |
| **IntelligenceSearchPanel** | Property Intelligence | `features/property-intelligence/components/intelligence-search-panel.tsx` |
| **MarketFilterCascade** | Property Intelligence | Cascading 11-filter panel |
| **SearchFilters** | Search (DB mode) | `features/search/components/search-filters.tsx` |

**Filter UX patterns:**
- Cascading resets: master community change → reset community + building
- Filter groups with uppercase labels
- Reset button top-right
- "All" sentinel in select dropdowns
- Size/price as min/max number pair

---

### 5.5 Search

| Component | Path | Purpose |
|---|---|---|
| **ListingsSearchBar** | `features/search/components/listings-search-bar.tsx` | Large search input + filter toggle |
| **CommunitiesHeader search** | `features/communities/components/communities-header.tsx` | Community/project search |
| **WelcomeHeader search** | `features/dashboard/components/welcome-header.tsx` | Dashboard quick search (placeholder) |

**Search bar pattern:** Gold search icon left; `rounded-2xl`; result count below.

---

### 5.6 Dialogs & drawers

| Component | Type | Path |
|---|---|---|
| **PropertyDetailsDrawer** | Sheet (right) | `features/search/components/property-details-drawer.tsx` |
| **PricingReportDialog** | Dialog | `features/market-intelligence/components/pricing-report-dialog.tsx` |
| **IntelligencePdfDialog** | Dialog | `features/property-intelligence/components/intelligence-pdf-dialog.tsx` |
| **AiAssistantPanel** | Sheet (right) | `features/property-intelligence/components/ai-assistant-panel.tsx` |

**Drawer anatomy:**
1. Hero gradient header (property image or scope)
2. KPI grid
3. Sections: description, amenities, notes
4. Badge row footer

---

### 5.7 Pipeline / Kanban

| Component | Path | Purpose |
|---|---|---|
| **LeadsKanbanBoard** | `features/crm/components/leads/leads-kanban-board.tsx` | 6-column horizontal scroll |
| **DealsPipeline** | `features/crm/components/deals/deals-pipeline.tsx` | 5-stage deal pipeline |

**Kanban pattern:** Fixed-width columns (`w-[280px]`–`w-[300px]`); count badge in header; empty dashed state.

---

### 5.8 Badges & scores

| Component | Path | Variants |
|---|---|---|
| **PricePositionBadge** | `features/search/components/price-position-badge.tsx` | under_market, market_price, overpriced |
| **PriorityBadge** | `features/crm/components/priority-badge.tsx` | high, medium, low |
| **MarketScorePanel** | `features/market-intelligence/components/market-score-panel.tsx` | Investment tier badges |
| **MarketScoreBadge** | same | excellent, good, average, overpriced |

---

### 5.9 Module navigation

| Component | Path | Purpose |
|---|---|---|
| **CrmModuleTabs** | `features/crm/components/crm-module-tabs.tsx` | Leads / Viewings / Tasks / Deals |
| **ViewingsModule tabs** | `features/crm/components/viewings/viewings-module.tsx` | Calendar / Upcoming / Today / Past |

**Tab pattern:** `.paragon-card` container with inner pill buttons; gold active state.

---

### 5.10 Placeholders & empty states

| Component | Path |
|---|---|
| **PlaceholderPage** | `features/dashboard/components/placeholder-page.tsx` |
| **EmptyState** | `features/properties/components/empty-state.tsx` |
| **ViewingEmptyState** | `features/crm/components/viewings/viewing-card.tsx` |

---

## 6. Domain card templates (catalog)

Standard compositions for **future** modules — not all exist as standalone files yet.

### 6.1 Property Card

**Used in:** Search (table row + drawer), comparables tables.

**Fields:** Image/gradient, property code, community, type, price, beds, agent, price badge.

---

### 6.2 Market Card

**Used in:** Market summary grids, signal summary sidebar.

**Fields:** Label (uppercase), mono value, hint, optional trend arrow.

---

### 6.3 Agent Card

**Planned:** Agents module (`/agents`).

**Fields:** Avatar, name, license, agency, active listings count, pipeline value.

---

### 6.4 Community Card

**Used in:** Master community expandable cards, residential project cards.

**Fields:** Gradient hero, master badge, project count, ROI preview.

---

## 7. Maps (planned — Phase 5)

**Status:** Not implemented in UI.

**Planned component:** `src/components/maps/property-map.tsx`

**Provider options:** Mapbox GL or Google Maps Platform.

**Usage:** Community intelligence (nearby schools, beaches), property detail location, search results map view.

**Design:** Dark map style matching Paragon shell; gold markers for selected property; cluster markers at zoom out.

---

## 8. Component ownership rules

| Layer | Location | Rule |
|---|---|---|
| **Primitives** | `src/components/ui/` | Generic, zero business logic |
| **Layout** | `src/components/layout/` | App shell only |
| **Domain** | `src/features/*/components/` | Module-specific composition |
| **Shared domain** | `src/components/` (future) | Cross-feature cards when 3+ modules need them |

**Promotion rule:** Move a feature component to `src/components/` only when **three or more** features import it.

---

## 9. Accessibility

- Radix primitives provide focus trap, ESC close, ARIA roles
- Form fields paired with `Label`
- Color not sole indicator — badges include text labels
- Table rows keyboard-accessible (Phase 2 enhancement)

---

## 10. Print styles

PDF report generation uses:
- `.pricing-report-print-source` — off-screen print target
- `@media print` rules in `globals.css`
- White paper preview inside dark dialog

---

*LARSSH Component Library v1.0 — Documents existing UI; no redesign*
