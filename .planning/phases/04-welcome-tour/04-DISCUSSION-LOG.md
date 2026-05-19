# Phase 4: Tutorial de Boas Vindas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 04-welcome-tour
**Areas discussed:** Escopo, Overlay, Mobile-only, Gatilho, Progressão

---

## 1. Escopo do Tutorial

| Option | Description | Selected |
|--------|-------------|----------|
| 3 passos (v1) | Cliente → Serviço → Agendamento | |
| 5 passos (v2) | Cliente → Serviço → Agendamento → Concluir → Transação | ✓ |

**User's choice:** 5 passos (mesma ordem da v2)
**Notes:** Sequência idêntica à implementação anterior: criar cliente, criar serviço, criar agendamento, concluir atendimento, registrar transação.

---

## 2. Mecanismo de Overlay

| Option | Description | Selected |
|--------|-------------|----------|
| Dialog/Modal (v1) | Radix Dialog centralizado, mais simples | |
| Tooltip posicionado (v2) | Aponta para o elemento-alvo com overlay | ✓ |

**User's choice:** Tooltip posicionado no elemento-alvo
**Notes:** Similar à v2, com destaque visual no elemento e overlay semi-transparente no fundo.

---

## 3. Comportamento Mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Só mobile | Tutorial aparece apenas em viewport <= 640px | ✓ |
| Mobile primeiro | Versão desktop depois | |

**User's choice:** Apenas mobile. Desktop não exibe tutorial.

---

## 4. Gatilho de Início

**User's choice:** Dual trigger — menu manual + automático no primeiro login com modal de confirmação
**Notes:** 
- Primeira visita: modal "Quer fazer um tour rápido?" (Sim / Agora não)
- Se "Agora não": flag localStorage, nunca mais pergunta
- Sempre acessível pelo menu em /meus-dados ou /perfil
- Detecção de primeira visita via flag `tour_first_visit` no localStorage

---

## 5. Progressão

| Aspect | Decision |
|--------|----------|
| Avanço entre passos | Auto-advance ao detectar criação da entidade |
| Navegação entre páginas | Auto-navegação (redireciona automaticamente) |
| Form fechado sem criar | Passo permanece ativo |

---

## the agent's Discretion

- Texto exato dos tooltips e modal
- Design/cores/animação do tooltip
- Posicionamento exato relativo ao elemento
- Tratamento de edge cases (elemento não visível)

## Deferred Ideas

- Versão desktop do tutorial — fase futura
- Tutorial de funcionalidades avançadas — fase futura
