---
phase: 08-retencao-clientes
plan: 01
subsystem: ui
tags: [react, nextjs, tailwindcss, shadcn, dashboard, retention, progress-bars]

# Dependency graph
requires:
  - phase: 06-rankings-insights
    provides: Dashboard page structure, InsightsSection pattern, card/separator composition
  - phase: 05-metricas-financeiras
    provides: Card/loading/skeleton patterns from FinancialSummaryCards
provides:
  - Return frequency distribution UI (5 buckets: semanal → outros)
  - Client lifecycle stage UI (4 stages: novatos → leais)
  - Retention section composed into Dashboard page below Insights
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Progress bar with custom indicator colors via [&_[data-slot=progress-indicator]]:bg-{color}"
    - "Card composition: Card + CardHeader/CardTitle/CardDescription + CardContent + Progress"
    - "Section composition: Separator + heading + subsection cards"

key-files:
  created:
    - src/app/dashboard/ReturnFrequencyCard.tsx
    - src/app/dashboard/ClientLifecycleCard.tsx
    - src/app/dashboard/RetentionSection.tsx
  modified:
    - src/hooks/useDashboardAgendamentos.ts
    - src/app/dashboard/page.tsx

key-decisions:
  - "Used descendant combinator [&_[data-slot=progress-indicator]] instead of child combinator [&>[data-slot=progress-indicator]] to correctly target the nested progress indicator element inside Progress component's root"
  - "Pre-built Tailwind wrapper class strings in config arrays (not dynamic interpolation) to ensure Tailwind JIT detects them at build time"

patterns-established:
  - "Card progress bars: row layout with label left, count+percentage right, colored Progress bar below — reused across ReturnFrequencyCard and ClientLifecycleCard"
  - "Empty state: totalCount === 0 triggers 'Nenhum dado no período' message"
  - "Loading state: Skeleton h-[200px] replaces card content"

requirements-completed: [RET-01, RET-02]

# Metrics
duration: 12min
completed: 2026-05-21
---

# Phase 08 Plan 01: Retenção de Clientes Summary

**Dashboard retention section with frequency distribution (5 buckets) and client lifecycle stages (4 stages) as colored progress bars with count and percentage**

## Performance

- **Duration:** 12 min
- **Completed:** 2026-05-21
- **Tasks:** 3 / 3
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments

- **RET-01 — Return frequency visualization:** 5 buckets (Semanal, Quinzenal, Mensal, Trimestral, Outros) rendered as horizontal progress bars with labeled colors, showing count and percentage per bucket
- **RET-02 — Client lifecycle visualization:** 4 stages (Novatos, Em Teste, Estabelecidos, Leais) rendered as horizontal progress bars with color gradient (slate → blue → amber), showing count and percentage per stage
- **Retention section composed on Dashboard:** Integrated below InsightsSection with Separator, heading, and both cards stacked vertically
- **Reactive data flow:** Both cards receive data from `frequenciaRetorno` and `lifetimeClientes` hooks, updating automatically when DateRangeFilter changes
- **Hook data exposure:** `counts: buckets` added to `lifetimeClientes` return for raw stage counts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ReturnFrequencyCard + expose counts in hook** - `fc6a056` (feat)
2. **Task 2: Create ClientLifecycleCard** - `bc27d5b` (feat)
3. **Task 3: Create RetentionSection + page.tsx integration** - `1ffd6bb` (feat)

## Files Created/Modified

- `src/app/dashboard/ReturnFrequencyCard.tsx` — Created: 5-bucket frequency distribution with colored progress bars (67 lines, named export)
- `src/app/dashboard/ClientLifecycleCard.tsx` — Created: 4-stage lifecycle with pre-computed percentage bars (70 lines, named export)
- `src/app/dashboard/RetentionSection.tsx` — Created: Section compositing Separator + heading + both cards (65 lines, named export)
- `src/hooks/useDashboardAgendamentos.ts` — Modified: Added `counts: buckets` to lifetimeClientes return object
- `src/app/dashboard/page.tsx` — Modified: Added RetentionSection import and JSX after InsightsSection

## Decisions Made

- Used `[&_[data-slot=progress-indicator]]` (descendant combinator) instead of `[&>[data-slot=progress-indicator]]` (child combinator) because the progress indicator is nested inside the Progress component's root element (`data-slot="progress"`), not a direct child of the wrapper div
- Pre-built Tailwind wrapper class strings stored in config arrays rather than dynamically constructed with string interpolation, ensuring Tailwind v4 JIT compiler detects all classes at build time

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed progress indicator color selector**
- **Found during:** Task 1 (ReturnFrequencyCard creation)
- **Issue:** Plan specified `[&>[data-slot=progress-indicator]]:bg-{color}` using the CSS child combinator (`>`), but the progress indicator element is nested inside `ProgressPrimitive.Root` (which renders `data-slot="progress"`), making it a grandchild of the wrapper div — the child combinator would never match
- **Fix:** Changed to `[&_[data-slot=progress-indicator]]:bg-{color}` using the descendant combinator (space), correctly targeting the indicator regardless of nesting depth
- **Files modified:** `src/app/dashboard/ReturnFrequencyCard.tsx`, `src/app/dashboard/ClientLifecycleCard.tsx`
- **Verification:** Tailwind class resolves correctly at build time
- **Committed in:** fc6a056, bc27d5b (part of Task 1 and Task 2 commits)

**2. [Rule 1 - Bug] Fixed dynamic Tailwind class construction**
- **Found during:** Task 1 (ReturnFrequencyCard creation)
- **Issue:** Using template literal `` `[&_[data-slot=progress-indicator]]:${colorClass}` `` to construct class names dynamically — Tailwind v4 JIT cannot detect dynamically interpolated class strings and would not generate the corresponding CSS
- **Fix:** Moved full wrapper class strings into the bucketConfig/stageConfig arrays as pre-built static strings (e.g., `'[&_[data-slot=progress-indicator]]:bg-blue-500'`) so Tailwind JIT scans them at build time
- **Files modified:** `src/app/dashboard/ReturnFrequencyCard.tsx`, `src/app/dashboard/ClientLifecycleCard.tsx`
- **Verification:** Classes detected at build time, `npx tsc --noEmit` passes with zero errors
- **Committed in:** fc6a056, bc27d5b (part of Task 1 and Task 2 commits)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for correct visual rendering. No scope creep.

## Issues Encountered

- None — execution was smooth, TypeScript validation passed with zero errors on first run.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Retention section complete, no further work in this phase
- Dashboard now has all 4 planned sections: Financial Metrics, Rankings & Insights, Weekly Revenue Chart, and Retention
- The full dashboard reformulation (v4.0 milestone) is ready for human verification

## Self-Check: PASSED

All 5 files confirmed present on disk. All 3 commit hashes confirmed in git log. TypeScript compilation (`npx tsc --noEmit`) passes with zero errors.

---

*Phase: 08-retencao-clientes*
*Completed: 2026-05-21*
