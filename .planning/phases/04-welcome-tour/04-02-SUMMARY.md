---
phase: 04-welcome-tour
plan: 02
subsystem: tour
tags: [tour, tutorial, onboarding, entities]
requires: [04-01]
provides: [tourSteps, WelcomeTour, data-tour attributes]
affects: [clientes, servicos, agendamentos, transacoes, AgendamentoCard]
tech-stack:
  added: [Next.js router.push for tour navigation, interval-based element detection]
  patterns: [data-* attributes for DOM targeting]
key-files:
  created:
    - src/components/tour/tourSteps.ts
    - src/components/tour/WelcomeTour.tsx
  modified:
    - src/app/clientes/page.tsx
    - src/app/servicos/page.tsx
    - src/app/agendamentos/page.tsx
    - src/app/agendamentos/AgendamentoCard.tsx
    - src/app/transacoes/page.tsx
decisions:
  - data-tour attributes on existing elements instead of creating new wrapper elements
  - Tour auto-navigates between entity pages via router.push
  - Periodic element visibility check (300ms) to confirm page is loaded
metrics:
  duration: ~10min
  completed: 2026-05-17
---

# Phase 04 Plan 02: Tour Entity Integration Summary

**One-liner:** Definição de 5 etapas do tour integradas com as páginas reais via data-tour selectors e WelcomeTour component.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Definir etapas do tour em tourSteps.ts | `2400ac3` | `src/components/tour/tourSteps.ts` |
| 2 | Adicionar data-tour selectors nos componentes | `2400ac3` | `clientes/page.tsx`, `servicos/page.tsx`, `agendamentos/page.tsx`, `AgendamentoCard.tsx`, `transacoes/page.tsx` |
| 3 | Criar WelcomeTour integrando tour com páginas | `1784581` | `src/components/tour/WelcomeTour.tsx` |

## Key Technical Details

### tourSteps.ts (60 lines)
- `TourStep` interface: id, title, content, targetSelector, pageUrl, action
- 5 steps: cliente → servico → agendamento → concluir → transacao
- Each step targets a `[data-tour="..."]` selector on the entity creation button

### data-tour Attributes (5 elements)
| Page | Selector | Element |
|------|----------|---------|
| /clientes | `[data-tour="add-cliente"]` | FAB button (+ icon) |
| /servicos | `[data-tour="add-servico"]` | FAB button (+ icon) |
| /agendamentos | `[data-tour="add-agendamento"]` | "Novo" button in header |
| /agendamentos | `[data-tour="concluir-agendamento"]` | AgendamentoCard (swipe target) |
| /transacoes | `[data-tour="add-transacao"]` | FAB button (+ icon) |

### WelcomeTour.tsx (174 lines)
- Integrates TourContext + TourOverlay + TourTooltip with tourSteps
- Auto-navigates to correct entity page when step changes via `router.push()`
- Periodic visibility check (300ms) to detect when target element is rendered
- Handles "next" → navigates to next step's page before advancing
- Handles "prev" → navigates to previous step's page before going back
- Renders nothing when inactive or navigating between pages

## Deviations from Plan
None — plan executed exactly as written.

## Self-Check: PASSED

All files verified and TypeScript compiles with zero errors.
