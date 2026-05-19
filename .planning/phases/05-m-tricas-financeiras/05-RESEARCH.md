# Phase 5: Métricas Financeiras — Research

**Date:** 2026-05-19
**Status:** Complete

## Domain Analysis

### Goal
User can see a financial overview with income, expenses, balance and a visual chart comparing both.

### Requirements
| ID | Description |
|----|-------------|
| FIN-01 | Total income (ENTRADA) for selected filter period as a card |
| FIN-02 | Total expenses (SAIDA) for selected filter period as a card |
| FIN-03 | Balance (income - expenses) for selected filter period |
| FIN-04 | Visual chart (bars/pie) showing income vs expenses proportion |

## Data Model Analysis

### Income Data Source
- **Appointments (Agendamento)** with `status === 'CONCLUIDO'`
- Revenue = `servico.preco` (joined from Servico model)
- Already partially computed in `useDashboardAgendamentos.ts` as `receitaPorDiaSemana`

### Expense Data Source
- **Transactions (Transacao)** with `tipo === 'SAIDA'` and `status === 'CONCLUIDO'`
- Stored in Dexie `transacoes` table
- Fields: `valor`, `dataHora`, `tipo`, `status`, `observacoes`

### Current Data Flow
1. `useDashboardAgendamentos` loads all appointments via `AgendamentoService.listWithDetails()`
2. Filters by date range in `DashboardFilters`
3. Computes derived metrics: `receitaPorDiaSemana`, `topClientes`, etc.
4. Dashboard page consumes these metrics

**Gap:** No transaction data is loaded in the current hook. Expense computation requires adding `TransacaoService` queries.

## Chart Library Recommendation: Recharts

**Decision:** Use Recharts (v3) — not Chart.js

| Factor | Recharts | Chart.js |
|--------|----------|----------|
| React-native | ✅ Declarative JSX components | ❌ Needs react-chartjs-2 wrapper |
| Bundle impact | ~200KB (tree-shakeable) | ~60KB + wrapper |
| Responsive | `<ResponsiveContainer>` built-in | Manual resize handling |
| Tailwind integration | Native SVG (style via className) | Canvas-based |
| Benchmark | 89.44 / 100 | 79.84 / 100 |

### Key Recharts Components to Use
- `<BarChart>` + `<Bar>` — for income vs expense comparison bars
- `<PieChart>` + `<Pie>` — alternative proportional visualization
- `<ResponsiveContainer>` — responsive sizing
- `<Tooltip>` — value display on hover
- `<Legend>` — labels
- `<Cell>` — per-bar/per-slice coloring

### Recharts Installation
```bash
npm install recharts
```

No TypeScript types needed — Recharts ships with them.

## Implementation Strategy

### Option A: Extend existing `useDashboardAgendamentos` hook
- Add `useTransacao()` data loading to the hook
- Add `receitaTotal`, `despesaTotal`, `saldo` computed values
- Pros: Single source of truth, existing filter reuse
- Cons: Makes existing hook larger, potential refactoring

### Option B: Create dedicated `useFinancialMetrics` hook
- New hook combining appointment + transaction data
- Computes income, expenses, balance with filter propagation
- Pros: Clean separation, Phase 5 scoped
- Cons: Duplicate data loading, filter sync needed

**Recommendation: Option A** — extend existing hook. It already:
- Has filter infrastructure (`DashboardFilters`)
- Loads appointment data with details
- Computes derived metrics with `useMemo`
- Returns data in the right shape for cards

The expense computation is additive and follows the exact same pattern.

### Financial Metric Computation

```typescript
// Income: sum of service prices from CONCLUIDO appointments in filter period
const receitaTotal = filtrados
  .filter(ag => ag.status === 'CONCLUIDO')
  .reduce((sum, ag) => sum + (ag.servico?.preco ?? 0), 0);

// Expenses: sum of SAIDA CONCLUIDO transactions in filter period
const despesaTotal = transacoes
  .filter(tx => tx.tipo === 'SAIDA' && tx.status === 'CONCLUIDO')
  .filter(tx => dentroDoPeriodo(tx.dataHora, filters))
  .reduce((sum, tx) => sum + tx.valor, 0);

// Balance
const saldo = receitaTotal - despesaTotal;
```

### Chart Design
- **Bar chart**: Two side-by-side bars (income green, expense red) for comparison
- **Pie chart**: Proportional donut showing income % vs expense %
- **Layout**: Horizontal bar chart more readable on mobile

### Card Design Pattern
Follow existing `KPICard` component pattern but with:
- Income: green accent, positive icon (TrendingUp or ArrowUp)
- Expense: red accent, negative icon (TrendingDown or ArrowDown)
- Balance: highlighted with conditional color (green if positive, red if negative)
- Value formatted with `formatCurrency` (already exists in dashboard page)

## Existing Patterns to Follow

1. **Component co-location**: Cards in `src/app/dashboard/` (following `DateRangeFilter.tsx`)
2. **Hook pattern**: Extend `useDashboardAgendamentos.ts` (existing filter + memo pattern)
3. **UI pattern**: `Card` + `CardHeader` + `CardContent` from shadcn (existing usage)
4. **Formatting**: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` (already exists as `formatCurrency`)

## Known Constraints

- **No server sync**: All data is local IndexedDB
- **Mobile-first**: 2-column grid for cards (existing pattern), full width chart
- **Theme-aware**: Dark/light mode already handled by Tailwind + next-themes
- **PWA compatibility**: Recharts is SVG-based — works in Service Worker context
- **Query key discipline**: New query keys for transactions follow `src/lib/queryKeys.ts` pattern

## Common Pitfalls to Avoid

1. **❌ Loading all transactions without filters** — Use date filtering in the service query or memory filter
2. **❌ Hardcoding colors** — Use Tailwind CSS color variables (`text-emerald-500`, `text-red-500`)
3. **❌ Chart SSR issues** — Recharts requires client-side rendering (`"use client"`)
4. **❌ Ignoring Recharts bundle size** — Import only what's needed: `import { BarChart, Bar, ... } from 'recharts'`
5. **❌ Read-only transactions** — No mutation needed; just read existing data
