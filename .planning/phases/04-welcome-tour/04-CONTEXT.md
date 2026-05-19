# Phase 4: Tutorial de Boas Vindas - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Tutorial de boas-vindas mobile-first que guia novos usuários na criação das primeiras entidades e uso do app. Exibido apenas em mobile (viewport <= 640px). O usuário é conduzido passo a passo via tooltips posicionados nos elementos-alvo da interface.

</domain>

<decisions>
## Implementation Decisions

### Escopo (5 Passos)
- **D-01:** 5 passos sequenciais, mesma ordem da v2:
  1. Criar Cliente (`/clientes`)
  2. Criar Serviço (`/servicos`)
  3. Criar Agendamento (`/agendamentos`)
  4. Concluir Atendimento (`/agendamentos`)
  5. Registrar Transação (`/transacoes`)

### Mecanismo de Overlay
- **D-02:** Tooltip posicionado no elemento-alvo da página (via `data-tour` selectors), não Dialog centralizado
- **D-03:** Tooltip com seta apontando para o elemento, título, descrição e navegação (próximo/anterior/pular)
- **D-04:** Destaque visual (overlay semi-transparente) no resto da tela, similar à v2

### Mobile-Only
- **D-05:** Tutorial aparece APENAS em viewport mobile (<= 640px)
- **D-06:** Em desktop, o tutorial não é exibido de nenhuma forma
- **D-07:** Futuramente pode-se criar versão desktop — fora do escopo atual

### Gatilho de Exibição
- **D-08:** Gatilho duplo:
  - **Automático:** Na primeira visita (flag `tour_first_visit` no localStorage não existe), exibir modal de confirmação: "Quer fazer um tour rápido?" com opções "Sim" / "Agora não"
  - **Manual:** Opção "Tutorial" acessível pelo menu do usuário (página `/meus-dados` ou `/perfil`) para reiniciar o tour
- **D-09:** Flag `tour_first_visit` é criada no localStorage quando o usuário opta por "Agora não" ou completa o tour
- **D-10:** Se usuário escolher "Agora não", o modal não reaparece — o tour fica acessível apenas pelo menu

### Navegação e Progressão
- **D-11:** Auto-navegação entre páginas — ao concluir um passo, o tooltip leva o usuário automaticamente para a página do próximo passo
- **D-12:** Auto-advance na detecção de criação da entidade — sistema identifica que o formulário foi submetido com sucesso e avança automaticamente
- **D-13:** Se o usuário fechar o form sem criar, o passo permanece ativo (não avança)

### Skip / Dismiss
- **D-14:** Opção "Pular tutorial" disponível em qualquer passo (link pequeno, tom discreto)
- **D-15:** Pular tutorial marca todos os passos como completos e não exibe novamente

### Detecção de Primeira Visita
- **D-16:** Flag `tour_first_visit` no localStorage
- **D-17:** Se flag não existe → primeira visita → mostrar modal de confirmação
- **D-18:** Se flag existe → não mostrar modal automaticamente

### the agent's Discretion
- Texto exato do modal de confirmação e dos tooltips
- Design do tooltip (cores, tamanho, animação)
- Posicionamento exato do tooltip relative ao elemento (top/bottom/left/right)
- Duração da transição entre passos
- Tratamento de edge cases (elemento não visível na tela, scroll forçado)

</decisions>

<canonical_refs>
## Canonical References

### Contexto anterior (para referência)
- `.planning/notes/tutorial-v4-decisoes-ux.md` (commit 9160a1f) — Decisões de UX da v1, parcialmente substituídas pelas decisões acima
- `.planning/phases/04-01-tutorial-criacao-entidades/04-RESEARCH.md` (commit f7cb63d) — Pesquisa técnica da v1, overlay patterns considerados

### Padrões do código existente
- `src/components/ui/` — Componentes Radix UI disponíveis (dialog, alert-dialog, card, progress)
- `src/hooks/` — Padrão de hooks com localStorage (seguir padrão existente)
- `src/components/layout/AppLayout.tsx` — Ponto de integração do provider do tour
- `src/app/clientes/page.tsx`, `src/app/servicos/page.tsx`, `src/app/agendamentos/page.tsx`, `src/app/transacoes/page.tsx` — Páginas que receberão data-tour attributes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/alert-dialog.tsx` — Pode ser usado para o modal de confirmação "Quer fazer um tour rápido?"
- `src/components/ui/progress.tsx` — Pode ser usado para indicador de progresso do tour
- `src/hooks/useBase.ts` — Padrão de hook para consulta

### Established Patterns
- Componentes em `src/components/<dominio>/` — Manter consistência (ex: `src/components/tour/`)
- Hooks em `src/hooks/` com sufixo `use<Nome>`
- localStorage acessado via hooks com guard `typeof window !== 'undefined'`
- Dados locais via Dexie/IndexedDB

### Integration Points
- `AppLayout.tsx` — Inserir TourProvider para disponibilizar estado do tour globalmente
- Páginas de entidades — Adicionar `data-tour` attributes nos botões de ação (FAB, "Novo")
- Página de perfil/meus-dados — Adicionar opção "Tutorial" no menu

</code_context>

<specifics>
## Specific Ideas

- Tooltip destacando o elemento-alvo com overlay semi-transparente no fundo (como v2)
- Avanço automático assim que o sistema detectar a criação da entidade (após submit bem-sucedido do form)
- Auto-navegação: ao finalizar passo, redirecionar para a próxima página automaticamente
- Se usuário diz "Agora não" no modal, nunca mais perguntar automaticamente

</specifics>

<deferred>
## Deferred Ideas

- Versão desktop do tutorial — fase futura
- Tutorial para funcionalidades avançadas (backup, exportar dados) — fase futura

</deferred>

---

*Phase: 04-welcome-tour*
*Context gathered: 2026-05-19*
