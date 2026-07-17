# Phase 8: Retenção de Clientes — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Display client return frequency distribution (weekly, biweekly, monthly, quarterly) and client lifecycle stages (newcomers, testing, established, loyal) with counts and percentages.

Requirements covered: RET-01, RET-02

</domain>

<decisions>
## Implementation Decisions

### Data Layer
- Already fully implemented in `useDashboardAgendamentos` hook — `frequenciaRetorno` (buckets: semanal, quinzenal, mensal, trimestral, outros + mediaDias) and `lifetimeClientes` (distribuicao: novatosPercent, emTestePercent, estabelecidosPercent, leaisPercent + tempoMedioMeses) are computed in useMemo blocks.
- Both are already destructured in `src/app/dashboard/page.tsx` and available for UI consumption.
- Phase 8 requires **no new data layer work** — only UI visualization.

### Section Placement
- **D-01:** Retention lives on the **Dashboard tab** (not a new bottom tab). Added as a new section **below Insights** (after Phase 6 InsightsSection, before the closing `</main>`).

### Section Layout
- **D-02:** **Stacked vertically** — Frequência card on top, Lifecycle card below. Full width each.

### Frequência Visualization (RET-01)
- **D-03:** Visualized as **horizontal progress bars per bucket** (semanal, quinzenal, mensal, trimestral, outros).
- Each bar shows: bucket label + count + percentage.
- This is a card component: `ReturnFrequencyCard` or similar.

### Lifecycle Visualization (RET-02)
- **D-04:** Visualized as **horizontal progress bars per stage** (novatos, emTeste, estabelecidos, leais).
- Each bar shows: stage label + count + percentage.
- This is a card component: `ClientLifecycleCard` or similar.

### Filter Scope
- **D-05:** Filter-responsive — retention metrics respect the DateRangeFilter (current behavior). Changes when user picks a different date range.

### Agent's Discretion
- Component naming (e.g., `RetentionSection`, `ReturnFrequencyCard`, `ClientLifecycleCard`)
- Colors/icons per bucket (e.g., clock icon for semanal, calendar for mensal, etc.)
- Colors per lifecycle stage (gradient from muted for novatos to bright for leais)
- Empty state messages when no data
- Loading state skeleton pattern
- Whether to show `mediaDias` (average return days) and `tempoMedioMeses` (average lifecycle months) as summary stats in the cards
- Responsive layout for the progress bars

### Folded Todos
None — data layer already complete, pure UI phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — RET-01, RET-02 definitions

### Codebase
- `src/hooks/useDashboardAgendamentos.ts:350-397` — `frequenciaRetorno` computation (returns `buckets`, `mediaDias`, `diffsDias`)
- `src/hooks/useDashboardAgendamentos.ts:399-465` — `lifetimeClientes` computation (returns `distribuicao`, `tempoMedioMeses`, `mesesPorCliente`)
- `src/app/dashboard/page.tsx` — Dashboard tab content; `frequenciaRetorno` and `lifetimeClientes` already destructured from hook. New RetentionSection to be added after InsightsSection.
- `src/app/dashboard/InsightsSection.tsx` — Reference pattern for section layout with Separator dividers.

### Patterns
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, component patterns
- `.planning/codebase/STRUCTURE.md` — Component placement (co-located in `src/app/dashboard/`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Card container
- `src/components/ui/skeleton.tsx` — Loading skeleton
- `src/components/ui/separator.tsx` — Section dividers
- `src/components/ui/progress.tsx` — Progress bar primitive (shadcn/ui)
- `src/app/dashboard/InsightsSection.tsx` — Reference pattern for section with Separator dividers
- `src/app/dashboard/FinancialSummaryCards.tsx` — Reference for card component with loading/error/empty states

### Established Patterns
- **Client components**: `"use client"` directive at top
- **formatCurrency**: `Intl.NumberFormat("pt-BR", ...)` defined locally per component
- **Loading state**: Skeleton matching component dimensions
- **Component placement**: Co-located in `src/app/dashboard/`
- **Section pattern**: Section with `<Separator>` divider, card with CardHeader/CardContent

### Integration Points
- `src/app/dashboard/page.tsx` — Import and render RetentionSection after InsightsSection, pass `frequenciaRetorno` and `lifetimeClientes` as props
- No hook modifications needed — data already flows from hook → page → components

### Data Shapes
```typescript
// Already available in page.tsx:
frequenciaRetorno = {
  diffsDias: number[],
  mediaDias: number,
  buckets: {
    semanal: number,    // 7-10 days
    quinzenal: number,  // 14-17 days
    mensal: number,     // 28-35 days
    trimestral: number, // 80-100 days
    outros: number,
  }
}

lifetimeClientes = {
  mesesPorCliente: number[],
  distribuicao: {
    novatosPercent: number,          // 0-3 months
    emTestePercent: number,          // 3-6 months
    estabelecidosPercent: number,    // 6-12 months
    leaisPercent: number,            // 12+ months
  },
  tempoMedioMeses: number,
}
```

</code_context>

<specifics>
## Specific Ideas

- Both cards use horizontal progress bars with label on left, count + % on right
- Progress bars colored by intensity: semanal/leais more vibrant (primary), outros/novatos more muted
- Each bar shows: "Semanal 3 clientes (35%)" or similar format
- Average values (mediaDias and tempoMedioMeses) shown as summary lines in each card header
- Section sits after Phase 6 InsightsSection, before closing `</main>`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-retencao-clientes*
*Context gathered: 2026-05-21*
