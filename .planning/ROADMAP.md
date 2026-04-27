# Roadmap - Agenda Barbearia

## Marcos

- ✅ **v3.0** — Filtros por Período + UI Mobile (shipped 2026-04-22)
- 🚧 **v4.0** — Tutoriais e Onboarding (in progress)

---

## v3.0 — Phases 2-3 (COMPLETO)

<details>
<summary>✅ v3.0 — shipped 2026-04-22</summary>

### Phase 2: UI de Transações Mobile (COMPLETO)

- [x] 02-01: Componente de Lista Mobile-First
- [x] 02-02: Integração
- [x] 02-03: Empty State + Totais
- [x] 02-04: Verificação

### Phase 3: Filtros por Período (COMPLETO)

- [x] 03-01: DateRangeFilter Integration
- [x] 03-02: Filter + Empty State
- [x] 03-03: Human Verification

</details>

---

## v4.0 — Tutoriais e Onboarding

### Phase 4.1: Tutorial de Criação de Entidades

**Objetivo:** Criar componente de tutorial para guiar o usuário na criação de entidades

### Tarefas

- [ ] Criar componente TutorialOverlay com passos
- [ ] Adicionar tutorial na página de clientes
- [ ] Adicionar tutorial na página de serviços
- [ ] Adicionar tutorial na página de agendamentos

**Critério de conclusão:** Usuário consegue seguir tutorial e criar ENTITY

---

### Phase 4.2: Tutorial de Backup

**Objetivo:** Criar tutorial de backup e restauração

### Tarefas

- [ ] Adicionar tutorial de backup na página de perfil
- [ ] Adicionar tutorial de restauração
- [ ] Explicar uso de senha

**Critério de conclusão:** Usuário entende como fazer backup

---

### Phase 4.3: Exibição Automática

**Objetivo:** Exibir tutorial automaticamente no primeiro acesso

### Tarefas

- [ ] Detectar primeiro acesso via localStorage
- [ ] Mostrar tutorial automaticamente
- [ ] Adicionar opção de pular
- [ ] Adicionar opção de rever tutorial

**Critério de conclusão:** Tutorial exibe no primeiro acesso

---

## Plans

- [ ] 04-01-01-PLAN.md — useTutorial hook + TutorialStep types
- [ ] 04-01-02-PLAN.md — TutorialOverlay + StepIndicator + clientes page
- [ ] 04-01-03-PLAN.md — servicos + agendamentos page integrations

---

## Progress

| Phase                  | Milestone | Plans Complete | Status      | Completed  |
| --------------------- | --------- | ---------------| ----------- | ---------- |
| 2. UI Mobile          | v3.0      | 4/4            | Complete    | 2026-04-22 |
| 3. Filters            | v3.0      | 3/3            | Complete    | 2026-04-22 |
| 4.1 Tutorial Entities| v4.0      | 0/3            | Not started  | -          |
| 4.2 Tutorial Backup  | v4.0      | 0/2            | Not started  | -          |
| 4.3 Auto Display     | v4.0      | 0/2            | Not started  | -          |