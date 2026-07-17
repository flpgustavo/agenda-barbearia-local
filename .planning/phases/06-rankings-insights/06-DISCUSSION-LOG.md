# Phase 6: Rankings & Insights — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 06-rankings-insights
**Areas discussed:** Dashboard section ordering

---

## Dashboard Section Ordering

### Where should the new Insights section go?

| Option | Description | Selected |
|--------|-------------|----------|
| Create "Insights (12 meses)" as a separate section where Retention was | Replaces the commented-out Retention section position | ✓ |
| Merge Top Clientes 12mo with existing card | Expand existing card to show both filter and 12mo views | |
| Group everything into a tabbed "Rankings & Insights" area | Abas/separate area | |

**User's choice:** Separate "Insights (12 meses)" section replacing Retention position
**Notes:** Positioned between weekly revenue chart and the bottom of the dashboard

### Section internal structure

| Option | Description | Selected |
|--------|-------------|----------|
| Cards lado a lado | Grid with 3 cards side by side | |
| Lista vertical | Vertical list with dividers between blocks | ✓ |
| Menu de abas | Tabs within the section | |

**User's choice:** Vertical list with dividers

### What to do with existing Top Clientes card?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both | Existing stays + Insights (12mo) in new section | |
| Replace | Remove old Top Clientes, Insights covers everything | ✓ |
| Merge | Compare filter period vs 12 months in same card | |

**User's choice:** Remove old Top Clientes card

### Where do service rankings (filter-based) go?

| Option | Description | Selected |
|--------|-------------|----------|
| Inside Insights | Unify everything in one place | ✓ |
| Separate above KPIs | Card between KPI and financial cards | |
| Group with Financial Cards | Alongside Phase 5 metrics | |

**User's choice:** Inside Insights section

### INSG-03 (12mo services): separate or combined with filter rankings?

| Option | Description | Selected |
|--------|-------------|----------|
| Inside Insights section | 12mo services in the new section, filter rankings separate | ✓ |
| Together in services block | Both in same card with comparison | |

**User's choice:** 12mo services inside Insights section alongside filter-period services

### Service rankings display format

| Option | Description | Selected |
|--------|-------------|----------|
| Single table | One table with columns: Service, Qty, Revenue | |
| Tabs Qtd/Receita | Two tabs: "Por Quantidade" and "Por Receita" | ✓ |
| Cards lado a lado | Two small cards: "Most Booked" and "Highest Revenue" | |

**User's choice:** Tabs (Por Quantidade / Por Receita)

### Inactive client threshold

| Option | Description | Selected |
|--------|-------------|----------|
| 30 days | 1 month without visit | |
| 60 days | 2 months without visit | |
| 90 days | 3 months, focus on truly lost clients | |
| Configurable | User chooses (30/60/90d selector) | ✓ |

**User's choice:** Configurable (30/60/90 days)

### Inactive client display

| Option | Description | Selected |
|--------|-------------|----------|
| List with days | Lists all inactive clients showing "X dias sem visita" | ✓ |
| Summary card | Shows count + alert, expandable to list | |
| Alert only | Badge/warning with count, no detailed list | |

**User's choice:** List with days since last visit

### Retention comments in code

| Option | Description | Selected |
|--------|-------------|----------|
| Remove | Clean up commented code | ✓ |
| Keep commented | Leave for reference (Phase 8) | |

**User's choice:** Remove commented Retention code

---

## Agent's Discretion

Areas where the user deferred to the agent:
- Visual design and styling of each insight block
- Loading skeleton patterns (follow Phase 5 pattern)
- Empty states for each block
- Data computation approach (new hook fields or inline useMemo)
- Configurable threshold UI component (select, radio, segmented control)
- Tabs component for service rankings (shadcn/ui Tabs or custom)

## Deferred Ideas

None.
