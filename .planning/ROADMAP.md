# Roadmap - Marco 3: Filtros de Período em Transações

**Plans:** 3 plans in 3 waves

### Phase 3.1: Reutilizar DateRangeFilter

**Objetivo:** Importar e adaptar componente de filtro existente

### Tarefas

- [x] Copiar DateRangeFilter para pasta de componentes compartilhados OU importar do dashboard
- [x] Verificar compatibilidade de props
- [x] Testar funcionamento básico

**Critério de conclusão:** DateRangeFilter rendering no header de transações

---

### Phase 3.2: Integrar Filtro com useTransacao

**Objetivo:** Conectar filtro ao hook de transações

### Tarefas

- [x] Adicionar parâmetros de filtro (dataInicio, dataFim) ao componente de página
- [x] Passar datas para o hook ou filtrar localmente
- [x] Implementar filtro por dataHora

**Critério de conclusão:** Liste filtra corretamente por período

---

### Phase 3.3: Totais Atualizados

**Objetivo:** Recalcular totais conforme filtro ativo

### Tarefas

- [x] Modificar TransacaoList para aceitar período
- [x] Calcular totais baseados no período filtrado
- [x] Exibir totais no rodapé

**Critério de conclusão:** Totais correspondem ao período selecionado

---

### Phase 3.4: Validação

**Objetivo:** Testar funcionalidades em diferentes cenários

### Tarefas

- [ ] Testar filtro "Este mês"
- [ ] Testar filtro "Personalizado"
- [ ] Testar empty state com filtro
- [ ] Testar responsividade mobile

**Critério de conclusão:** Filtros funcionam corretamente

---

## Plans

- [ ] 03-01-PLAN.md — Import and integrate DateRangeFilter
- [ ] 03-02-PLAN.md — Connect filter to transaction list
- [ ] 03-03-PLAN.md — Verify filter functionality