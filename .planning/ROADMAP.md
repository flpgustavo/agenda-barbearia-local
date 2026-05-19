# Roadmap - Agenda Barbearia

## Milestones

- ✅ **v3.0** — Filtros por Período + UI Mobile (shipped 2026-04-22)
- 🚧 **v4.0** — Reformulação do Dashboard (in progress)

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

## v4.0 — Reformulação do Dashboard

### Phases

- [ ] **Phase 5: Métricas Financeiras** — Cards de receita/despesa + gráfico visual
- [ ] **Phase 6: Rankings & Insights** — Rankings de serviços + insights de clientes
- [ ] **Phase 7: Disponibilidade & Ocupação** — Grid semanal por serviço + taxa de ocupação
- [ ] **Phase 8: Retenção de Clientes** — Frequência de retorno + estágios do ciclo de vida

## Phase Details

### Phase 5: Métricas Financeiras
**Goal**: User can see a financial overview with income, expenses, balance and a visual chart comparing both
**Depends on**: Phase 3 (DateRangeFilter already integrated in dashboard)
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04
**Success Criteria** (what must be TRUE):
   1. User can see total income (ENTRADA) displayed as a card for the selected filter period
   2. User can see total expenses (SAIDA) displayed as a card for the selected filter period
   3. User can see the balance (income - expenses) clearly highlighted with positive/negative indication
   4. User can see a visual chart (bars/pie) showing income vs expenses proportion
   5. All financial cards update reactively when DateRangeFilter period changes
**Plans**: TBD
**UI hint**: yes

### Phase 6: Rankings & Insights
**Goal**: User can see rankings of top services and top clients with inactive client detection
**Depends on**: Phase 5
**Requirements**: SERV-01, SERV-02, INSG-01, INSG-02, INSG-03
**Success Criteria** (what must be TRUE):
   1. User can see services ranked by appointment count in the filtered period
   2. User can see services ranked by revenue generated in the filtered period
   3. User can see top clients ranked by number of visits and total spending (last 12 months)
   4. User can see clients who haven't visited in a configurable period (inactive risk), with days since last visit
   5. User can see top services by quantity and revenue for the last 12 months (fixed period)
**Plans**: TBD
**UI hint**: yes

### Phase 7: Disponibilidade & Ocupação
**Goal**: User can view weekly availability grid by service and occupancy rates per day
**Depends on**: Phase 6
**Requirements**: DISP-01, DISP-02, DISP-03, OCUP-01
**Success Criteria** (what must be TRUE):
   1. User can select a service to view its available weekly time slots
   2. User can see a visual grid showing weekdays with free time slots for the selected service
   3. User can export the availability grid as an image via html-to-image
   4. User can see occupancy percentage (scheduled vs available slots) broken down per day of week
**Plans**: TBD
**UI hint**: yes

### Phase 8: Retenção de Clientes
**Goal**: User can understand client return patterns and lifecycle stages
**Depends on**: Phase 7
**Requirements**: RET-01, RET-02
**Success Criteria** (what must be TRUE):
   1. User can see return frequency distribution (weekly, biweekly, monthly, quarterly)
   2. User can see client lifecycle stages (newcomers, testing, established, loyal) with counts per stage
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 2. UI Mobile | v3.0 | 4/4 | Complete | 2026-04-22 |
| 3. Filters | v3.0 | 3/3 | Complete | 2026-04-22 |
| 5. Métricas Financeiras | v4.0 | 0/0 | Not started | - |
| 6. Rankings & Insights | v4.0 | 0/0 | Not started | - |
| 7. Disponibilidade & Ocupação | v4.0 | 0/0 | Not started | - |
| 8. Retenção de Clientes | v4.0 | 0/0 | Not started | - |
