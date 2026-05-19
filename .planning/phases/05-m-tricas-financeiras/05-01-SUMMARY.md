---
phase: 05-m-tricas-financeiras
plan: 01
subsystem: Dashboard
tags:
  - financial-metrics
  - hook
  - recharts
  - data-layer
dependency-graph:
  requires: []
  provides:
    - useDashboardAgendamentos returns receitaTotal, despesaTotal, saldo
    - recharts library available for chart components
  affects:
    - src/hooks/useDashboardAgendamentos.ts
    - package.json
tech-stack:
  added:
    - recharts ^3.8.1
  patterns:
    - Transaction data loaded alongside appointments via separate useQuery
    - Filter-driven reactivity applied to transaction filtering (same pattern as appointments)
    - Financial metrics computed via useMemo for reactive updates on filter change
key-files:
  created: []
  modified:
    - package.json
    - src/hooks/useDashboardAgendamentos.ts
decisions: []
metrics:
  duration: ~8 min
  completed: "2026-05-19"
---

# Phase 05 Plan 01: Financial Metrics Data Layer Summary

Extended the existing `useDashboardAgendamentos` hook to load transactions and compute financial metrics (income, expenses, balance) with filter-driven reactivity. Installed recharts as a production dependency for upcoming chart components.

**One-liner:** Transaction data loads alongside appointments via `transacaoService.list()`, with `receitaTotal` computed from CONCLUIDO appointment service prices, `despesaTotal` from SAIDA/CONCLUIDO transaction values, and `saldo` as their difference — all updating reactively on DateRangeFilter change.

## Tasks Executed

### Task 1: Install recharts package
- Installed `recharts@^3.8.1` as a production dependency
- Verified in package.json dependencies

### Task 2: Extend useDashboardAgendamentos with financial metrics
- Added `transacaoService` import
- Added second `useQuery` for transactions (`queryKeys.transacoes`)
- Renamed `isLoading: loading` → `isLoading: loadingAgendamentos`
- Added `loadingTransacoes` and combined `loading = loadingAgendamentos || loadingTransacoes`
- Added `transacoesFiltradas` useMemo with same date-filtering pattern as `filtrados`
- Added `receitaTotal` useMemo (sum of CONCLUIDO appointment `servico.preco`)
- Added `despesaTotal` useMemo (sum of SAIDA/CONCLUIDO transaction `valor`)
- Added `const saldo = receitaTotal - despesaTotal`
- Updated return object with `receitaTotal`, `despesaTotal`, `saldo`
- Verified `npx tsc --noEmit` passes with no errors

## Verification

- [x] `recharts` listed in package.json dependencies (`^3.8.1`)
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `import { transacaoService }`
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `loadingTransacoes`
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `transacoesFiltradas` useMemo
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `receitaTotal` useMemo
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `despesaTotal` useMemo
- [x] `src/hooks/useDashboardAgendamentos.ts` contains `const saldo = receitaTotal - despesaTotal`
- [x] Return object includes `receitaTotal`, `despesaTotal`, `saldo` keys
- [x] `npx tsc --noEmit` exits with code 0

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created/modified files verified: package.json, src/hooks/useDashboardAgendamentos.ts
All commits verified: 6ab6a7e, 935182f
