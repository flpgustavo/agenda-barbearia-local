---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Reformulação do Dashboard
status: definindo_requisitos
last_updated: "2026-05-19T10:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-19 — Milestone v4.0 started

## Milestones

- ✅ **v3.0** — Filtros por Período + UI Mobile (shipped 2026-04-22)
- ◆ **v4.0** — Reformulação do Dashboard (defining requirements)

## Accumulated Context

### Previous Milestone: v3.0

- Phase 3 (Filters) and Phase 2 (Mobile UI) completed
- Phase 4 (Welcome Tour) was planned and reverted in commit 29d32ae
- Existing codebase has TourProvider, data-tour attributes in pages
- Quick task completed: Mover Backup/Restore para "Meus Dados"

### Codebase State

- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Radix UI/Shadcn, Dexie (IndexedDB), Zustand, TanStack Query, PWA
- **Models:** Agendamento (clienteId, dataHora, servicoId, status), Servico (nome, duracaoMinutos, preco), Transacao (tipo ENTRADA/SAIDA, valor, agendamentoId), Cliente (nome, telefone)
- **Dashboard metrics already available in useDashboardAgendamentos:** receitaPorDiaSemana, topClientes, frequenciaRetorno, lifetimeClientes
- **Appointment availability:** AgendamentoService.gerarHorariosDisponiveis() and .verificarDisponibilidadeDia() already exist
- Hidden (commented) retention section with MetricsRow, lifetime client distribution

## Session Continuity

Last session: 2026-05-19
Stopped at: Milestone v4.0 started — defining requirements
