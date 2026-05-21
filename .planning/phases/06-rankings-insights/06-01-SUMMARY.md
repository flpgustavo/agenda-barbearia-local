---
phase: 06-rankings-insights
plan: 01
subsystem: Dashboard
tags:
  - rankings
  - insights
  - hook
  - data-layer
dependency-graph:
  requires: []
  provides:
    - servicosRanking (filter-period qty + revenue)
    - topServices12meses (12-month qty + revenue)
    - topClientes12meses (12-month visits + spending)
    - ultimaVisitaPorCliente (last visit date per client)
  affects:
    - src/hooks/useDashboardAgendamentos.ts
tech-stack:
  added: []
  patterns:
    - subMonths from date-fns for 12-month fixed-period filtering
    - Filter-period computations use filtrados (same as existing metrics)
    - Fixed-period computations use agendamentos (unfiltered) with date filter
    - All new fields follow existing useMemo pattern with correct dependency arrays

key-files:
  created: []
  modified:
    - src/hooks/useDashboardAgendamentos.ts
decisions: []
metrics:
  duration: ~5 min
  completed: "2026-05-21"
---

# Phase 06 Plan 01: Data Layer Summary

Extended `useDashboardAgendamentos` with four new computed fields for rankings and 12-month insights.

**One-liner:** Hook now returns filter-period service rankings (by qty + revenue), 12-month top services/ clients (fixed period), and a last-visit-per-client map for inactive detection — all via useMemo with proper deps.

## Tasks Executed

### Task 1: Extend useDashboardAgendamentos with Phase 6 metrics
- Added `import { subMonths } from "date-fns"`
- Added type definitions: `ServicoRankingItem`, `Cliente12mesesItem`, `UltimaVisitaEntry`
- Added `servicosRanking` useMemo (filter-based, grouped CONCLUIDO by servicoId, returns `{ porQuantidade, porReceita }`)
- Added `DOZE_MESES_ATRAS` constant and `topServices12meses` useMemo (12-month fixed, same structure)
- Added `topClientes12meses` useMemo (12-month fixed, sorted by gastoTotal descending)
- Added `ultimaVisitaPorCliente` useMemo (map of clienteId → { nome, ultimaData })
- Updated return object with all four new fields
- All existing code preserved intact
- Verified `npx tsc --noEmit` passes with no errors

## Verification

- [x] `import { subMonths } from "date-fns"` present
- [x] `interface ServicoRankingItem` defined
- [x] `interface Cliente12mesesItem` defined
- [x] `interface UltimaVisitaEntry` defined
- [x] `servicosRanking` useMemo present
- [x] `topServices12meses` useMemo present
- [x] `topClientes12meses` useMemo present
- [x] `ultimaVisitaPorCliente` useMemo present
- [x] Return object includes all four new fields
- [x] All existing return values still present (topClientes, frequenciaRetorno, etc.)
- [x] `npx tsc --noEmit` exits with code 0

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All changes verified: src/hooks/useDashboardAgendamentos.ts
Commits: c97d77d

## Next Plan Readiness

Wave 2 (06-02) can now consume `servicosRanking`, `topServices12meses`, `topClientes12meses`, and `ultimaVisitaPorCliente` from the hook.

---

*Phase: 06-rankings-insights*
*Completed: 2026-05-21*
