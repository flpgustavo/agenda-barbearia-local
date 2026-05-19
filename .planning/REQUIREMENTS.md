# Requirements: Agenda Barbearia

**Defined:** 2026-05-19
**Core Value:** Barbearias podem gerenciar agendamentos, clientes e finanças de forma simples e offline-first

## v4.0 Requirements

Requisitos para o marco v4.0 — Reformulação do Dashboard. Cada requisito mapeia para fases do roadmap.

### Métricas Financeiras

- [ ] **FIN-01**: User can see total income (ENTRADA) for the selected filter period as a card
- [ ] **FIN-02**: User can see total expenses (SAIDA) for the selected filter period as a card
- [ ] **FIN-03**: User can see balance (income - expenses) for the selected filter period
- [ ] **FIN-04**: User can see a visual chart (bars/pie) showing income vs expenses proportion

### Top Serviços

- [ ] **SERV-01**: User can see services ranked by appointment count in the filtered period
- [ ] **SERV-02**: User can see services ranked by revenue generated in the filtered period

### Insights (Últimos 12 meses)

- [ ] **INSG-01**: User can see top clients by visits and total spending (last 12 months)
- [ ] **INSG-02**: User can see clients who haven't visited in a configurable period (inactive risk)
- [ ] **INSG-03**: User can see top services by quantity and revenue (last 12 months)

### Grade de Disponibilidade Semanal

- [ ] **DISP-01**: User can select a service to view available weekly time slots
- [ ] **DISP-02**: User can see a visual grid of weekdays with free time slots for the selected service
- [ ] **DISP-03**: User can export the availability grid as image via html-to-image

### Taxa de Ocupação

- [ ] **OCUP-01**: User can see occupancy percentage (scheduled vs available slots) broken down per day of week

### Retenção de Clientes

- [ ] **RET-01**: User can see return frequency distribution (weekly, biweekly, monthly, quarterly)
- [ ] **RET-02**: User can see client lifecycle stages (newcomers, testing, established, loyal)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Produtos Físicos

- **PROD-01**: User can register physical products (shampoo, etc.) with name and price
- **PROD-02**: User can record product sales linked to appointments
- **PROD-03**: Product sales appear in financial metrics and top products insights

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Welcome Tour / Onboarding | Replaced by dashboard reformulation milestone. Deferred indefinitely. |
| Physical products | Deferred to future milestone. v1 focuses on services only. |
| Server sync / cloud auth | Existing limitation — app remains offline-first with IndexedDB |
| Desktop version of availability grid | Mobile-first for v4.0. Desktop can be added later. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIN-01 | — | Pending |
| FIN-02 | — | Pending |
| FIN-03 | — | Pending |
| FIN-04 | — | Pending |
| SERV-01 | — | Pending |
| SERV-02 | — | Pending |
| INSG-01 | — | Pending |
| INSG-02 | — | Pending |
| INSG-03 | — | Pending |
| DISP-01 | — | Pending |
| DISP-02 | — | Pending |
| DISP-03 | — | Pending |
| OCUP-01 | — | Pending |
| RET-01 | — | Pending |
| RET-02 | — | Pending |

**Coverage:**
- v4.0 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 ⚠️

---

*Requirements defined: 2026-05-19*
*Last updated: 2026-05-19 after initial definition*
