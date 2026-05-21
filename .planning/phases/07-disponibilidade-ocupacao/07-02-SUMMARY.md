---
phase: 07-disponibilidade-ocupacao
plan: 02
subsystem: ui
tags: [react, nextjs, tailwind, lucide-react, html-to-image, typescript]

requires:
  - "07-disponibilidade-ocupacao-plan-01 (DiaGrade/GradeSemanal interfaces, gerarGradeSemanal, useAvailabilityGrid hook)"
provides:
  - UI components for weekly availability grid
  - Bottom tab bar navigation (Dashboard / Disponibilidade)
  - Service horizontal selector row
  - Week navigator with prev/next buttons and export
  - Day column with occupancy % and free-time chips
affects: []

tech-stack:
  added: []
  patterns:
    - "Bottom tab bar: fixed positioning with pb-24 offset to prevent content overlap"
    - "State-based conditional rendering: activeTab switches between Dashboard and Disponibilidade"
    - "html-to-image export: toBlob with cacheBust, pixelRatio: 2, and HSL background color from CSS variable"
    - "Skeleton loading: 7-column placeholder grid matching DayColumn dimensions"

key-files:
  created:
    - src/app/dashboard/DayColumn.tsx
    - src/app/dashboard/DisponibilidadeGrid.tsx
    - src/app/dashboard/DisponibilidadeSkeleton.tsx
    - src/app/dashboard/ServiceSelectorRow.tsx
    - src/app/dashboard/WeekNavigator.tsx
    - src/app/dashboard/DisponibilidadeTab.tsx
  modified:
    - src/app/dashboard/page.tsx

key-decisions:
  - "useServico() returns items not servicos — aliased via const { items: servicos } = useServico()"
  - "Export strategy: download via anchor click (not navigator.share) — consistent with research finding that share has limited desktop support"
  - "Occupancy bar uses semaphore colors: green (<50%), amber (50-75%), red (>75%)"

metrics:
  duration: ~10min
  completed: 2026-05-21
---

# Phase 07 Plan 02: Grade de Disponibilidade — UI Components + Bottom Tab Bar

**6 new UI components for weekly availability grid with service selector, week navigation, PNG export, and bottom tab bar switching between Dashboard and Disponibilidade views**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 3
- **Files created:** 6
- **Files modified:** 1

## Accomplishments

- **DayColumn.tsx** — Individual day column with day name, formatted date, occupancy bar (color-coded), and free-time chips. Past days render at reduced opacity.
- **DisponibilidadeGrid.tsx** — Horizontally scrollable container of 7 DayColumn components. Accepts `exportRef` for html-to-image capture and `isExporting` prop to force `min-w-[980px]` for full-width PNG export.
- **DisponibilidadeSkeleton.tsx** — 7-column skeleton placeholder grid matching DayColumn dimensions.
- **ServiceSelectorRow.tsx** — Horizontally scrollable row of service cards showing service name ± BRL-formatted price. Selected card uses `bg-primary text-primary-foreground`. Empty state shows contextual message.
- **WeekNavigator.tsx** — ChevronLeft/ChevronRight week navigation buttons, "Semana de DD/MM a DD/MM" label, and Export button with Download icon + loading state.
- **DisponibilidadeTab.tsx** — Orchestrator component integrating all sub-components + hooks. Handles 4 states: loading (skeleton), error (destructive bar), no-service-selected (placeholder), empty (no services), and normal rendering.
- **page.tsx** — Modified to add `activeTab` state, conditional rendering between Dashboard content and `<DisponibilidadeTab />`, and a fixed bottom tab bar with BarChart3 (Dashboard) and CalendarDays (Disponibilidade) icons. Subtitle in header changes per active tab. DateRangeFilter only shows on Dashboard tab.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DayColumn, DisponibilidadeGrid and DisponibilidadeSkeleton** — `ca040f8` (feat)
2. **Task 2: Create ServiceSelectorRow, WeekNavigator and DisponibilidadeTab** — `b9cbfcb` (feat)
3. **Task 3: Add bottom tab bar and conditional rendering to page.tsx** — `fbd04b3` (feat)

## Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `src/app/dashboard/DayColumn.tsx` | Created | Individual day column component |
| `src/app/dashboard/DisponibilidadeGrid.tsx` | Created | 7-column grid container with export support |
| `src/app/dashboard/DisponibilidadeSkeleton.tsx` | Created | Loading skeleton placeholder |
| `src/app/dashboard/ServiceSelectorRow.tsx` | Created | Horizontal service card selector |
| `src/app/dashboard/WeekNavigator.tsx` | Created | Week nav + export button |
| `src/app/dashboard/DisponibilidadeTab.tsx` | Created | Orchestrator component |
| `src/app/dashboard/page.tsx` | Modified | Added tab bar + conditional rendering |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Alias useServico() return value**
- **Found during:** Task 2
- **Issue:** The plan assumed `useServico()` returns `{ servicos, loading, error }`, but the actual hook (via `useBase`) returns `{ items, rawItems, loading, error, criar, atualizar, remover, recarregar }`.
- **Fix:** Used destructuring alias `const { items: servicos, loading: loadingServicos } = useServico();` in `DisponibilidadeTab.tsx`.
- **Files modified:** `src/app/dashboard/DisponibilidadeTab.tsx`
- **Commit:** `b9cbfcb`

## Decisions Made

- **useServico() aliasing:** The plan's interface documentation for `useServico` was idealized; the actual hook returns `items` from `useBase`. Aliased during implementation.
- **Export download strategy:** Using anchor click download instead of `navigator.share` — consistent with the research finding that share has limited desktop support (Open Question #3 from research).
- **Occupancy bar colors:** Semaphore color scheme: emerald (<50%), amber (50-75%), red (>75%) — provides intuitive visual feedback.
- **Threat model:** Both T-07-03 (DoS — many slots) and T-07-04 (Information disclosure via export) accepted per plan's threat register. No additional mitigations needed for expected barber shop usage (~50 slots/day).

## Issues Encountered

None.

## Verification Results

- ✅ `npx tsc --noEmit` passes with zero errors
- ✅ 6 new component files created in `src/app/dashboard/`
- ✅ 1 file modified: `src/app/dashboard/page.tsx`
- ✅ All 3 tasks committed atomically with conventional commit messages

## Self-Check: PASSED

- `src/app/dashboard/DayColumn.tsx` — EXISTS
- `src/app/dashboard/DisponibilidadeGrid.tsx` — EXISTS
- `src/app/dashboard/DisponibilidadeSkeleton.tsx` — EXISTS
- `src/app/dashboard/ServiceSelectorRow.tsx` — EXISTS
- `src/app/dashboard/WeekNavigator.tsx` — EXISTS
- `src/app/dashboard/DisponibilidadeTab.tsx` — EXISTS
- `src/app/dashboard/page.tsx` — MODIFIED
- Commits: `ca040f8`, `b9cbfcb`, `fbd04b3` — all verified in git log

---

*Phase: 07-disponibilidade-ocupacao*
*Completed: 2026-05-21*
