---
phase: 07-disponibilidade-ocupacao
plan: 01
subsystem: data-layer
tags: [react-query, dexie, indexeddb, date-fns, typescript]

requires: []
provides:
  - GradeSemanal/DiaGrade interfaces for weekly availability data
  - gerarGradeSemanal(servicoId, weekStart?) bulk computation method
  - gradeDisponibilidade query key for cache invalidation
  - useAvailabilityGrid hook consuming gerarGradeSemanal via React Query
affects: [07-disponibilidade-ocupacao-plan-02, disponibilidade-ui]

tech-stack:
  added: []
  patterns:
    - "Service bulk query: single Dexie .between() range query for 7 days instead of 7 individual queries"
    - "Availability hook: useAvailabilityGrid wraps gerarGradeSemanal with React Query useQuery + enabled guard"

key-files:
  created:
    - src/hooks/useAvailabilityGrid.ts
  modified:
    - src/core/services/AgendamentoService.ts
    - src/lib/queryKeys.ts

key-decisions:
  - "passo = duracaoMinutos (D-03): slot step equals service duration, not fixed 30min"
  - "Single ranged IndexedDB query (.between) for all 7 days (D-10)"
  - "Appointment conflict detection uses selected service's duration for all appointments (conservative overlap)"
  - "gerarGradeSemanal returns always 7 days (Mon-Sun) with empty slots for past days"

patterns-established:
  - "Service method structure: fetch user + service config, bulk query appointments, loop days in memory"
  - "Hook pattern: useQuery with enabled guard, returning grade/loading/error/semanaLabel tuple"

requirements-completed: [DISP-01, DISP-02, DISP-03, OCUP-01]

duration: 12min
completed: 2026-05-21
---

# Phase 07 Plan 01: Grade Semanal de Disponibilidade — Camada de Dados

**Single-pass IndexedDB bulk query for 7-day weekly availability grid, with GradeSemanal/DiaGrade interfaces, gerarGradeSemanal service method, gradeDisponibilidade query key, and useAvailabilityGrid React Query hook**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-21 (session)
- **Completed:** 2026-05-21
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added exported `DiaGrade` and `GradeSemanal` interfaces to `AgendamentoService.ts`
- Added `gerarGradeSemanal(servicoId, weekStart?)` method that computes 7 days (Mon–Sun) in a single IndexedDB ranged query
- Added `gradeDisponibilidade` key to `queryKeys.ts` for React Query cache management
- Created `useAvailabilityGrid(servicoId, weekOffset)` hook wrapping `gerarGradeSemanal` via `useQuery` with `enabled: !!servicoId`

## Task Commits

Each task was committed atomically:

1. **Task 1: Adicionar interfaces GradeSemanal/DiaGrade + método gerarGradeSemanal** - `f990f9b` (feat)
2. **Task 2: Adicionar query key + criar hook useAvailabilityGrid** - `7e29de7` (feat)

## Files Created/Modified

- `src/core/services/AgendamentoService.ts` - Added `DiaGrade`, `GradeSemanal` interfaces (lines 14-30), `gerarGradeSemanal` method (lines 315-394), and date-fns imports (lines 6-7)
- `src/lib/queryKeys.ts` - Added `gradeDisponibilidade: ['gradeDisponibilidade'] as const` (line 9)
- `src/hooks/useAvailabilityGrid.ts` - New hook file consuming the service method via React Query (23 lines)

## Decisions Made

- `passo = duracaoMinutos` per D-03 (slot step equals service duration, not fixed 30min)
- Single ranged IndexedDB query with `.between(startISO, endISO)` per D-10 (avoids 7 individual queries)
- Appointment conflict detection uses the **selected service's duration** for all appointment end times (conservative approach — ensures the slot fully fits)
- Past-day slots (today before current time) are skipped, consistent with existing `gerarHorariosDisponiveis` behavior
- Query key includes both `servicoId` and `weekStart.toISOString()` so grid auto-refetches when service or week changes (D-07)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data layer for weekly availability grid is complete
- Ready for Plan 02 (UI components): `DisponibilidadeTab`, `ServiceSelectorRow`, `WeekNavigator`, `DayColumn`, `DisponibilidadeGrid`
- Hook returns `{ grade, loading, error, semanaLabel }` — UI components can consume directly
- Service method handles empty states (no user, no service) gracefully with empty result

---

*Phase: 07-disponibilidade-ocupacao*
*Completed: 2026-05-21*
