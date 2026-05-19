---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Reformulação do Dashboard
status: roadmap_definido
last_updated: "2026-05-19T10:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-19)

**Core value:** Barbearias podem gerenciar agendamentos, clientes e finanças de forma simples e offline-first
**Current focus:** Phase 5 — Métricas Financeiras

## Current Position

Phase: 5 of 8 (Métricas Financeiras)
Plan: 0 of 0 in current phase
Status: Ready to plan
Last activity: 2026-05-19 — Roadmap v4.0 defined (4 phases)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: N/A
- Total execution time: N/A

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

**Recent Trend:**
- Last 5 plans: N/A
- Trend: N/A

*Updated after each plan completion*

## Accumulated Context

### Decisions

- **[v4.0]**: Welcome Tour (Phase 4 originally) discarded per user instruction — all tour code reverted
- **[v4.0]**: Dashboard reformulation starts at Phase 5 (Phase 4 preserved for Welcome Tour numbering)
- **[v4.0]**: 4 phases (5-8) derived from 15 requirements: Financial Metrics → Rankings & Insights → Schedule & Occupancy → Retention

### Codebase State

- **Existing hooks:** `useDashboardAgendamentos` already computes `receitaPorDiaSemana`, `topClientes`, `frequenciaRetorno`, `lifetimeClientes`
- **Existing services:** `AgendamentoService.gerarHorariosDisponiveis()` and `verificarDisponibilidadeDia()` already implemented
- **Preexisting UI:** Retention section (RET-01, RET-02) is commented out in `dashboard/page.tsx` — data hooks ready, just needs uncommenting and polish
- **DateRangeFilter:** Already integrated on dashboard page — used by Phase 4 (FIN) and Phase 5 (SERV)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-05-19
Stopped at: Milestone v4.0 roadmap defined
Resume file: None
