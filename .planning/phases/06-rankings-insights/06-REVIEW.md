---
phase: 06-rankings-insights
reviewed: 2026-05-21T17:30:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/hooks/useDashboardAgendamentos.ts
  - src/app/dashboard/page.tsx
  - src/app/dashboard/ServiceRankings.tsx
  - src/app/dashboard/TopServices12months.tsx
  - src/app/dashboard/TopClients12months.tsx
  - src/app/dashboard/InactiveClients.tsx
  - src/app/dashboard/InsightsSection.tsx
  - src/components/ui/tabs.tsx
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-05-21T17:30:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

All eight files implementing Phase 6 (Rankings & Insights) were reviewed. The code follows the established project patterns (co-located components, shadcn/ui primitives, useMemo-based computations, loading/empty state handling). No critical bugs or security issues were found.

However, there are 6 warnings and 4 info-level findings:

- **5 unused imports** in `page.tsx` from the old Top Clientes card and Retention section cleanup (leftover artifacts)
- **1 loose equality** (`==`) in `page.tsx` where the rest of the codebase uses strict equality (`===`)
- **4 info findings** around pattern consistency, frozen date in InactiveClients, and duplicated helper functions

Dependency arrays in all useMemo hooks are correct. No runtime crashes or undefined access paths were found. All components handle loading, empty, and error states.

---

## Warnings

### WR-01: Unused imports in page.tsx (5 imports left over from cleanup)

**File:** `src/app/dashboard/page.tsx:3-6`
**Issue:** After removing the old Top Clientes card and commented-out Retention section, five imports are no longer used:
- `useEffect` (line 3, from React)
- `format` (line 4, from date-fns)
- `subDays` (line 4, from date-fns)
- `ptBR` (line 5, from date-fns/locale)
- `Calendar` (line 6, from lucide-react)

These were likely used by the removed sections but were not cleaned up.

**Fix:**
Remove the unused imports. The remaining date-fns imports (`startOfMonth`, `endOfMonth`) are still used in the `useState` initialization (lines 42-43).

```typescript
// Line 3-5 — remove useEffect, format, subDays, ptBR:
import React, { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
// (remove ptBR line entirely)

// Line 6 — remove Calendar:
import {
    RefreshCw,
    TrendingUp,
    Users,
    Clock,
    Wallet,
} from "lucide-react";
```

---

### WR-02: Loose equality (`==`) should be strict (`===`)

**File:** `src/app/dashboard/page.tsx:139**
**Issue:** Uses `==` for string comparison instead of `===`. The rest of the codebase (including all other status comparisons in `useDashboardAgendamentos.ts`) uses `===`. While `==` works here because both operands are strings, it's inconsistent and masks potential type mismatches.

```typescript
// Current:
a.status == "CONFIRMADO"

// Rest of codebase pattern:
ag.status === "CONCLUIDO"
ag.status === "CANCELADO"
```

**Fix:**
```typescript
a.status === "CONFIRMADO"
```

---

### WR-03: `DOZE_MESES_ATRAS` computed at render time, missing from useMemo dependency arrays

**File:** `src/hooks/useDashboardAgendamentos.ts:276`
**Issue:** `DOZE_MESES_ATRAS` is computed on every render (line 276), but the `useMemo` blocks that use it (`topServices12meses` at line 278, `topClientes12meses` at line 308) do not include it in their dependency arrays. This means:

1. `DOZE_MESES_ATRAS` is recalculated every render (new `Date()`), but...
2. The useMemo blocks won't re-run when it changes (it isn't in `deps`)
3. The memoized values will only recalculate when `agendamentos` changes — effectively masking the staleness

In practice this is harmless for a barber shop dashboard (page lifetime is session-scoped, and the date offset only changes once per month), but it violates the React `useMemo` contract and could cause subtle bugs if the page stays open across midnight or across a month boundary.

**Fix:**
Option A — Move the constant inside each useMemo:
```typescript
const topServices12meses = useMemo(() => {
    const DOZE_MESES_ATRAS = subMonths(new Date(), 12);
    // ... rest of computation
}, [agendamentos]);
```

Option B — Make it a proper dependency (semantically equivalent but more explicit):
```typescript
const DOZE_MESES_ATRAS = useMemo(() => subMonths(new Date(), 12), []);
// ...
const topServices12meses = useMemo(() => {
    // ...
}, [agendamentos, DOZE_MESES_ATRAS]);

const topClientes12meses = useMemo(() => {
    // ...
}, [agendamentos, DOZE_MESES_ATRAS]);
```

---

### WR-04: `useEffect` imported but unused in page.tsx (duplicate of WR-01)

**File:** `src/app/dashboard/page.tsx:3**
**Issue:** `useEffect` is imported (`import React, { useState, useEffect } from "react"`) but never called anywhere in the file. The "Agendamentos" filter and InsightsSection don't use side effects.

**Fix:** Remove `useEffect` from the import:
```typescript
import React, { useState } from "react";
```

(Already listed in WR-01 — included here separately for clarity.)

---

### WR-05: Missing `CardDescription` in `ServiceRankings.tsx` title mismatch

**File:** `src/app/dashboard/ServiceRankings.tsx:37`
**Issue:** The `CardDescription` text says "Ranking do período filtrado" but the component itself doesn't display which filter period is active. A user seeing "Semanal" bars above and this card below might think both refer to the same period. Consider showing the active filter dates (passed from the hook) for clarity.

**Severity:** This is a minor UX concern, not a bug. The component works correctly.

**Fix (optional):** Pass `dataInicio`/`dataFim` as props and display them in the description:
```typescript
<CardDescription>
    Ranking do período: {dataInicio} a {dataFim}
</CardDescription>
```

---

### WR-06: `InactiveClients` empty state wording inconsistency

**File:** `src/app/dashboard/InactiveClients.tsx:55**
**Issue:** When no inactive clients are found, the message says "Nenhum cliente inativo." This is correct when the `threshold` is set high (e.g., 90 days), but may be misleading when set low (e.g., 30 days) — it could mean "we have no data" rather than "all clients are active." Other components in the project use more specific wording (e.g., "Nenhum serviço realizado no período").

**Fix (optional):** Make the empty state contextual:
- If `ultimaVisitaPorCliente` has entries but none exceed threshold: "Todos os clientes visitaram nos últimos {threshold} dias."
- If `ultimaVisitaPorCliente` is empty: "Nenhum dado de cliente disponível."

---

## Info

### IN-01: Frozen `hoje` in InactiveClients (mount-time date)

**File:** `src/app/dashboard/InactiveClients.tsx:15**
**Issue:** `const hoje = useMemo(() => new Date(), [])` captures the date at mount time. If the user changes the threshold selector later, the inactive-client calculation uses the original `hoje`. This means the "days since last visit" numbers become progressively outdated as the page stays open.

**Fix:** Remove the `useMemo` wrapper and compute `hoje` inline:
```typescript
// Remove line 15 entirely
// Then in the useMemo (line 17-27), use new Date() directly:
const clientesInativos = useMemo(() => {
    const hoje = new Date();
    const entries = Object.entries(ultimaVisitaPorCliente)
        .map(([id, data]) => {
            const ultima = new Date(data.ultimaData);
            const diff = Math.round((hoje.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24));
            return { clienteId: id, nome: data.nome, diasSemVisita: diff };
        })
        .filter((c) => c.diasSemVisita > threshold)
        .sort((a, b) => b.diasSemVisita - a.diasSemVisita);
    return entries;
}, [ultimaVisitaPorCliente, threshold]);
```

---

### IN-02: Duplicated `formatCurrency` across 5 components

**File:** Multiple files
**Issue:** The `formatCurrency` helper is replicated in `page.tsx`, `ServiceRankings.tsx`, `TopServices12months.tsx`, `TopClients12months.tsx`, `FinancialSummaryCards.tsx`, and `IncomeVsExpenseChart.tsx`. This is the project convention (documented in CONVENTIONS.md), so it's not a violation — but it's worth noting for future refactoring.

**Suggestion:** Extract to `src/lib/formatCurrency.ts` when a 3rd duplication occurs in a future phase:

```typescript
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};
```

---

### IN-03: Type redeclaration in InsightsSection duplicates hook types

**File:** `src/app/dashboard/InsightsSection.tsx:10-22**
**Issue:** `ServiceRankingItem` and `Cliente12mesesItem` interfaces are re-declared in `InsightsSection.tsx`, duplicating the definitions from `useDashboardAgendamentos.ts`. If the hook types change, these local types must be updated manually.

**Fix:** Import the types from the hook if they are exported in the future, or accept the duplication as intentional self-documentation (current pattern).

---

### IN-04: `Card` `onClick` in page.tsx may cause accidental deselection

**File:** `src/app/dashboard/page.tsx:162**
**Issue:** The weekly revenue `<Card onClick={() => setDiaSelecionado(null)}>` clears the selected bar when clicking anywhere on the card background. The bar clicks have `e.stopPropagation()`, so individual bars are protected — but clicking the empty space between bars, or on the footer area, resets the selection. This is an existing behavior (pre-Phase 6), not introduced here, but worth noting.

**Current behavior:** Intentional — clicking away from bars dismisses the popup tooltip.

---

## Findings Summary

| ID | Severity | File | Line(s) | Description |
|----|----------|------|---------|-------------|
| WR-01 | Warning | page.tsx | 3-6 | 5 unused imports left from cleanup |
| WR-02 | Warning | page.tsx | 139 | `==` should be `===` |
| WR-03 | Warning | useDashboardAgendamentos.ts | 276 | `DOZE_MESES_ATRAS` not in useMemo deps |
| WR-04 | Warning | page.tsx | 3 | `useEffect` imported but unused |
| WR-05 | Warning | ServiceRankings.tsx | 37 | Description doesn't show active filter period |
| WR-06 | Warning | InactiveClients.tsx | 55 | Empty state wording could be ambiguous |
| IN-01 | Info | InactiveClients.tsx | 15 | Frozen `hoje` to mount time |
| IN-02 | Info | Multiple | — | `formatCurrency` duplicated in 5 components |
| IN-03 | Info | InsightsSection.tsx | 10-22 | Type duplication from hook |
| IN-04 | Info | page.tsx | 162 | Card onClick clears bar selection area |

## Verifications Checklist

| Check | Status | Notes |
|-------|--------|-------|
| No crashes or undefined accesses | ✅ Pass | All null checks in place (`ag.servico &&`, `ag.cliente &&`, `?? 0`) |
| Proper useMemo dependency arrays | ⚠️ Partial | `DOZE_MESES_ATRAS` missing from 2 useMemo deps (WR-03) |
| Edge cases handled (empty, loading, error) | ✅ Pass | All 5 insight components handle all 3 states |
| No dead code or unused imports | ❌ Fail | 5 unused imports in page.tsx (WR-01) |
| Consistent styling with existing dashboard | ✅ Pass | Same shadcn Card/Skeleton/Separator pattern, same `formatCurrency` convention |

---

_Reviewed: 2026-05-21T17:30:00Z_
_Reviewer: gsd-code-reviewer (deepseek-v4-flash-free)_
_Depth: standard_
