# Agenda Barbearia - Projeto

## Visão Geral

**Inicio:** Abril 2026  
**Stack:** Next.js, TypeScript, Tailwind CSS, Radix UI, Dexie (IndexedDB), PWA  

## Funcionalidades

- Dashboard com agendamentos do dia
- Gestão de clientes
- Gestão de serviços
- Gestão de agendamentos
- Gestão de transações financeiras
- Backup local (criptografado)
- Sistema PWA offline-first

## Histórico de Marcos

### Marco 1: Modal de Transações

**Objetivo:** Substituir Drawer por Modal para gestão de transações

**Status:** Planejado

- Fase 1.1: Componente Modal
- Fase 1.2: Integração
- Fase 1.3: Validação

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