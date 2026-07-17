---
phase: quick-260618-jo5
plan: 01
subsystem: registration + demo-data
tags: ["seeder", "registration", "demo-data", "tour", "onboarding"]
dependency-graph:
  requires: ["Seeder from 260618-j1r"]
  provides: ["Demo data flow after registration"]
  affects: ["src/core/db/seeder.ts", "src/app/register/page.tsx", "src/components/demo/DemoDataModal.tsx", "src/components/tour/TourProvider.tsx"]
tech-stack:
  added: []
  patterns: ["Dexie transaction for atomic table clears"]
key-files:
  created:
    - path: "src/components/demo/DemoDataModal.tsx"
      description: "Modal with demo data explanation and clear/keep buttons"
  modified:
    - path: "src/core/db/seeder.ts"
      description: "Removed usuarios seeding, added usuarios guard"
    - path: "src/app/register/page.tsx"
      description: "Added seedDatabase call and demo_data_shown flag on registration"
    - path: "src/components/tour/TourProvider.tsx"
      description: "Integrated DemoDataModal after tour resolves"
decisions:
  - "Use localStorage flag demo_data_shown to prevent modal from reappearing"
  - "Clear does NOT touch usuarios table — user stays active"
  - "600ms delay before showing demo modal for smooth UX transition"
metrics:
  duration: "~6 min"
  completed_date: "2026-06-18"
  tasks_completed: 3
  total_commits: 3
---

# Phase Quick 260618-jo5: Ajuste o seeder para deixar cadastrar o próprio usuário primeiro

Adjust seeder and registration flow so users register their own account before demo data is populated, with a post-tour modal explaining the data is fictional and offering a clear option.

## Completed Tasks

### Task 1: Remove usuarios from seeder + update registration to trigger seed

**Files:** `src/core/db/seeder.ts`, `src/app/register/page.tsx`

- Removed `Usuario` import, full `usuarios` array, and `bulkAdd(usuarios)` from seeder
- Added guard: if `usuarios.count() === 0`, skip seeding (no registered user yet)
- Removed `Usuários` from seeder summary output
- Added `seedDatabase(db)` call and `demo_data_shown = "false"` localStorage flag to registration success callback
- Changed success callback from sync to `async`

**Commit:** `f3cf6c1`

### Task 2: Create DemoDataModal component

**Files:** `src/components/demo/DemoDataModal.tsx` (new)

- AlertDialog explaining demo data is fictional
- "Manter dados e explorar" — sets `demo_data_shown = "true"`, closes modal, keeps data
- "Limpar dados de demonstração" — clears `clientes`, `servicos`, `agendamentos`, `transacoes` in a single Dexie transaction, sets `demo_data_shown` + `agenda_cleared` flags, reloads page
- Does NOT touch `usuarios` table — user account remains active

**Commit:** `46d4c55`

### Task 3: Integrate DemoDataModal into TourProvider

**Files:** `src/components/tour/TourProvider.tsx`

- Imported `DemoDataModal` and added `showDemoModal` state
- Added `checkAndShowDemoModal()` function + `useEffect` for tour completion/skip
- Triggers after: desktop accept (no tour), dismiss, mobile tour completes or is skipped
- Rendered `<DemoDataModal>` after `<TourConfirmationModal>`

**Commit:** `27e48bc`

## Deviations from Plan

None — plan executed exactly as written.

## Pre-existing Issues (not caused by this task)

- `npm run build` fails on `/dashboard` with a JavaScript runtime error (`Cannot read properties of undefined (reading 'call')`) — this error existed before our changes. TypeScript compilation passes successfully.

## Success Criteria

- [x] seeder.ts no longer contains usuarios data or bulkAdd
- [x] seeder.ts skips if usuarios.count() === 0
- [x] register/page.tsx calls seedDatabase and sets demo_data_shown flag
- [x] DemoDataModal.tsx exists with clear and keep-data buttons
- [x] DemoDataModal clears 4 tables atomically without touching usuarios
- [x] TourProvider.tsx imports and renders DemoDataModal
- [x] Demo modal triggers after tour resolves in all scenarios
- [x] Full TypeScript build compiles with no errors (pre-existing dashboard runtime error unrelated)

## Self-Check

- [x] `src/core/db/seeder.ts` — `!includes('bulkAdd(usuarios)')`, `includes('usuarios.count()')`
- [x] `src/app/register/page.tsx` — `includes('seedDatabase')`, `includes('demo_data_shown')`, `includes('async ()')`
- [x] `src/components/demo/DemoDataModal.tsx` — exists, `includes('clientes.clear')`, `includes('demo_data_shown')`, `includes('agenda_cleared')`, `!includes('usuarios')`
- [x] `src/components/tour/TourProvider.tsx` — `includes('DemoDataModal')`, `includes('showDemoModal')`, `includes('checkAndShowDemoModal')`, `includes('demo_data_shown')`
- [x] No accidental file deletions across all 3 commits

## Self-Check: PASSED
