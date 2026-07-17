# Agenda Barbearia - Projeto

## Visão Geral

**Inicio:** Abril 2026  
**Stack:** Next.js, TypeScript, Tailwind CSS, Radix UI, Dexie (IndexedDB), PWA  
**Current Version:** v4.0

## Current Milestone: v4.0 Reformulação do Dashboard

**Goal:** Reformular o dashboard com métricas financeiras, insights de clientes/serviços, grid de disponibilidade semanal e taxas de ocupação.

**Target features:**
- Balanço financeiro entradas/saídas (cards + gráfico)
- Top serviços (por quantidade e receita)
- Insights sem período fixo (últimos 12 meses): melhores clientes, melhores serviços, clientes inativos
- Grid de disponibilidade semanal por serviço (com exportação html-to-image)
- Taxa de ocupação por dia da semana
- Reativar métricas de retenção (ciclo de retorno + estágio dos clientes)

## Estado Atual

### v3.0 — SHIPPED (2026-04-22)

**Features shipping:**
- UI de transações mobile-first com cards responsivos
- Filtros por período (Este mês, Mês anterior, Personalizado)
- Empty state contextual

## Funcionalidades

- Dashboard com agendamentos do dia
- Gestão de clientes
- Gestão de serviços
- Gestão de agendamentos
- Gestão de transações financeiras
- Backup local (criptografado)
- Sistema PWA offline-first

## Histórico de Marcos

### Marco 3: Filtros por Período ✅ COMPLETO

**Objetivo:** Filtrar transações por período na página de transações

**Status:** Completo (2026-04-22)

- Fase 3.1: DateRangeFilter Integration
- Fase 3.2: Filter + Empty State
- Fase 3.3: Human Verification

<details>
<summary>Detalhes</summary>

- DateRangeFilter integrado na página de transações
- Filtros: Este mês, Mês anterior, Personalizado
- Label mostra 01/MM até DD/MM (último dia do mês)
- Empty state contextual por período

</details>

### Marco 2: UI de Transações Mobile ✅ COMPLETO

**Objetivo:** Melhorar listagem de transações para mobile com UI limpa e bonita

**Status:** Completo (2026-04-22)

- Fase 2.1: Component List (Mobile-first)
- Fase 2.2: Integração
- Fase 2.3: Validação

<details>
<summary>Detalhes</summary>

- TransacaoListItem + TransacaoList componentes
- Breakpoint 640px para mobile/desktop
- Badge de status com cores
- Valor verde (ENTRADA) / vermelho (SAIDA)

</details>

### Marco 1: Modal de Transações

**Objetivo:** Substituir Drawer por Modal para gestão de transações

**Status:** Planejado

- Fase 1.1: Componente Modal
- Fase 1.2: Integração
- Fase 1.3: Validação

## Próximos Marcos

### Marco 4: Reformulação do Dashboard (em andamento)

**Objetivo:** Reformular o dashboard com métricas financeiras, insights, disponibilidade e ocupação

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI (Shadcn)
- Dexie (IndexedDB)
- Zustand (state management)
- TanStack Query
- PWA (Service Worker)
- i18n (pt-BR)

## Limitações Atuais

- Dados apenas no browser (sem sync server)
- Sem autenticação real
- backup usa senha hardcoded

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-05-19 after starting v4.0 milestone_