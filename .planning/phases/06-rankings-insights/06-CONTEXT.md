# Phase 6: Rankings & Insights — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Display service rankings (by appointment count and revenue) and client insights (top clients by visits/spending, top services by quantity/revenue in the last 12 months, and inactive client detection).

Requirements covered: SERV-01, SERV-02, INSG-01, INSG-02, INSG-03

</domain>

<decisions>
## Implementation Decisions

### Section Organization
- **D-01:** All rankings and insights go into a single "Insights (12 meses)" section positioned where the Retention section was (commented out) — between the weekly revenue chart and the bottom of the dashboard.
- **D-02:** The existing "Top Clientes" section is **removed** — the new Insights section covers everything (filter-period top clients + 12-month views).
- **D-03:** The commented-out Retention code is **removed** — Insights replaces that position.
- **D-04:** Internal structure is a **vertical list with Separator dividers** between each insight block.

### Section Order (top to bottom)
1. **Service Rankings (filter period)** — abas "Por Quantidade" / "Por Receita"
2. **Top Services (12 months)** — quantity + revenue
3. **Top Clients (12 months)** — visits + total spending
4. **Inactive Clients** — configurable threshold with days since last visit

### Service Rankings (SERV-01, SERV-02)
- Displayed as tabs: "Por Quantidade" and "Por Receita"
- Respects the DateRangeFilter period
- Shown inside the Insights section as the first block

### Top Clients (INSG-01 — 12 months)
- Shows top clients by visits and total spending for the **last 12 months** (fixed period, not affected by DateRangeFilter)
- Replaces the old filter-based Top Clientes card

### Inactive Client Detection (INSG-02)
- **D-05:** Threshold is **configurable** — user can choose 30, 60, or 90 days
- Shows a **list** of inactive clients with "X dias sem visita" displayed per client
- The `useDashboardAgendamentos` hook already computes `frequenciaRetorno` and `lifetimeClientes` which can be used for this computation

### Top Services 12 Months (INSG-03)
- Shows top services by quantity and revenue for the **last 12 months** (fixed period)
- Separate from the filter-period service rankings above it

### Agent's Discretion
- Visual design of each insight block (card styling, colors, icons)
- Loading skeleton patterns (follow Phase 5 pattern)
- Empty states for each block
- Data computation approach (new hook fields or inline useMemo)
- How to handle the configurable threshold UI (select, radio, or segmented control)
- Format of the tabs component for service rankings (shadcn/ui Tabs or custom)

### Folded Todos
None — no pending todos matched Phase 6.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — SERV-01, SERV-02, INSG-01, INSG-02, INSG-03 definitions

### Codebase
- `src/hooks/useDashboardAgendamentos.ts` — Existing hook with `topClientes` (filter-based), `frequenciaRetorno`, `lifetimeClientes` computations
- `src/app/dashboard/page.tsx` — Dashboard layout with existing sections, Top Clientes card (to be replaced), commented-out Retention section (to be removed)
- `src/app/dashboard/FinancialSummaryCards.tsx` — Reference for client component pattern (co-located, shadcn/ui Card, Skeleton, formatCurrency)
- `src/app/dashboard/IncomeVsExpenseChart.tsx` — Reference for chart component pattern

### Patterns
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, component patterns, state management
- `.planning/codebase/STRUCTURE.md` — Where to add dashboard components (co-located in `src/app/dashboard/`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/table.tsx` — Available for tabular rankings layout
- `src/components/ui/badge.tsx` — Available for badges on rankings
- `src/components/ui/card.tsx` — Card component used throughout dashboard
- `src/components/ui/skeleton.tsx` — Loading skeleton pattern
- `src/components/ui/separator.tsx` — For section dividers
- `src/components/ui/progress.tsx` — Available for progress bars
- `@/hooks/useDashboardAgendamentos` — Already computes `topClientes` (visits, gastoTotal, ticketMedio), `frequenciaRetorno` (return cycle), `lifetimeClientes` (lifecycle stages)

### Established Patterns
- **Client components**: `"use client"` directive at top
- **formatCurrency**: `Intl.NumberFormat("pt-BR", ...)` defined locally per component (consistent with existing dashboard pattern)
- **Loading state**: Skeleton placeholders matching component dimensions
- **Component placement**: Co-located in `src/app/dashboard/` (not in shared components)
- **Hook integration**: Props passed from hook to component, reactive on filter change
- **Chart library**: recharts (installed Phase 5)

### Integration Points
- `useDashboardAgendamentos` hook needs new computed fields for 12-month data (separate from filter-based)
- `src/app/dashboard/page.tsx` needs new section between Revenue chart and closing div
- Old `topClientes` card removed from page.tsx
- Retention commented block removed from page.tsx

</code_context>

<specifics>
## Specific Ideas

- Services use **tabs** (Qtd / Receita) for the filter-period ranking
- Inactive clients show **days since last visit** in the list
- The configurable threshold (30/60/90d) should be a simple selector — agent's discretion on exact UI component

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-rankings-insights*
*Context gathered: 2026-05-21*
