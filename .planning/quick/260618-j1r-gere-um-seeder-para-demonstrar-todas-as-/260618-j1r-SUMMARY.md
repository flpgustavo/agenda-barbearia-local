---
phase: quick
plan: 260618-j1r
subsystem: Database Seeder
tags: [seeder, demo-data, typed-models, dexie]
dependency-graph:
  requires: []
  provides: [src/core/db/seeder.ts, src/core/db/index.ts]
  affects: [Todas as telas que consomem dados do banco]
tech-stack:
  added: []
  patterns: [ISO string dates instead of Date objects, typed arrays without `any`]
key-files:
  created: []
  modified:
    - src/core/db/seeder.ts
    - src/core/db/index.ts
decisions:
  - "Segundo barbeiro (usr-2: Carlos Jr.) adicionado para demonstrar multi-barbeiro"
  - "Futuras transacoes DEBITO adicionadas para despesas realistas"
  - "db.transaction com array de tabelas em vez de argumentos individuais (Dexie typing limit)"
metrics:
  duration: ~8min
  completed_date: 2026-06-18
---

# Quick Task 260618-j1r: Gerar um seeder para demonstrar todas as funcionalidades do sistema

**One-liner:** Seeder completo com 5 tabelas, 62 agendamentos (51 CONCLUIDO, 7 CONFIRMADO, 4 CANCELADO), 56 transacoes (51 ENTRADA + 5 SAIDA), distribuicao realista de horarios/dias/meses, e ativacao automatica via `db.on("ready")`.

## What Was Built

### src/core/db/seeder.ts — Complete Rewrite (313 lines)

**Data generated:**
| Table | Records | Details |
|-------|---------|---------|
| Servicos | 5 | Corte Degrade, Barba Completa, Combo, Pezinho, Platinado |
| Usuarios | 2 | Mestre Barbeiro + Carlos Jr. (multi-barbeiro) |
| Clientes | 6 | VIP, Mensalista, Semanal, Sumido, Recente, Cancelador |
| Agendamentos | 62 | 51 CONCLUIDO + 7 CONFIRMADO + 4 CANCELADO |
| Transacoes | 56 | 51 ENTRADA (vinculadas) + 5 SAIDA (despesas independentes) |

**Key improvements over old seeder:**
- Typed arrays (`Agendamento[]`, `Transacao[]`, etc.) — no `any[]`
- No phantom `criadoPor` field (removed entirely)
- All dates are ISO strings (`.toISOString()`), not Date objects
- Mixed statuses: CONCLUIDO (past), CONFIRMADO (future 5-15 days ahead), CANCELADO (past + future with reasons)
- Transacoes ENTRADA for every CONCLUIDO agendamento, valor matches `servico.preco`
- Transacoes SAIDA: Aluguel (R$1200), Luz (R$180), Produtos (R$250), Agua (R$90), Limpeza (R$45) — no `agendamentoId`
- Realistic time distribution: Mon-Sat, 8-11 or 14-17, across 12 months
- `observacoes` on some records (reasons for cancellation, VIP client preferences)

### src/core/db/index.ts — Seed Activation (3 lines uncommented)
- `db.on("ready", async () => { await seedDatabase(db); })` is now active
- Guard inside `seedDatabase` checks `servicos.count()` — idempotent, only seeds on first load

## Deviations from Plan

None — plan executed exactly as written. Three TypeScript compilation errors encountered during initial verification and fixed inline:
1. **Line 81:** `servicoPreco[s.id]` — `s.id` could be `undefined` (BaseModel). Fixed with `if (s.id)` guard.
2. **Line 188:** `servicoId` from random `servicos[...].id` — could be `undefined`. Fixed with `!` assertion.
3. **Line 289:** `db.transaction('rw', ...tables, callback)` — Dexie overloads cap at 6 args. Used array form `['rw', [tables], callback]` instead.

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation (`npx tsc --noEmit`) | PASSED — no errors |
| No `any[]` types | PASSED — grep found no matches |
| No `criadoPor` field | PASSED — grep found no matches |
| All 5 tables seeded | PASSED — code confirmed |
| Mixed statuses (CONCLUIDO, CONFIRMADO, CANCELADO) | PASSED — 51/7/4 respectively |
| ENTRADA transacoes for each CONCLUIDO with correct valor | PASSED — servicoPreco lookup used |
| SAIDA transacoes exist (no agendamentoId) | PASSED — 5 expense records |
| Future CONFIRMADO appointments (5-15 days) | PASSED — dataFutura generates future dates |
| Realistic time distribution | PASSED — Mon-Sat, 8-11/14-17, across 12 months |
| Seed call uncommented in index.ts | PASSED — `db.on("ready")` active |
| Idempotency guard (`count > 0`) | PASSED — remains at top of seedDatabase |

## Success Criteria

- [x] seeder.ts compiles with no TypeScript errors
- [x] seeder.ts uses proper typed imports (no `any`, no phantom fields)
- [x] All 5 tables (servicos, usuarios, clientes, agendamentos, transacoes) are seeded
- [x] Agendamentos contain CONCLUIDO, CONFIRMADO (future), and CANCELADO statuses
- [x] Transacoes ENTRADA exist for every CONCLUIDO agendamento with correct valor
- [x] Transacoes SAIDA exist (3-5 expense records)
- [x] Future CONFIRMADO appointments exist (5-15 days ahead)
- [x] Time distribution is realistic (varied hours, weekdays, across months)
- [x] `index.ts` has uncommented `db.on("ready", ...)` calling `seedDatabase(db)`
- [x] Guard `if (count > 0) return;` remains — seeding is idempotent

## Commits

| Hash | Message |
|------|---------|
| `b35d309` | `feat(quick-260618-j1r): rewrite seeder with comprehensive typed data for all 5 tables` |
| `fa28e42` | `feat(quick-260618-j1r): uncomment seedDatabase call on db.ready event` |

## Self-Check

- [x] `src/core/db/seeder.ts` — exists and compiles
- [x] `src/core/db/index.ts` — exists with uncommented seed call
- [x] Commit `b35d309` exists
- [x] Commit `fa28e42` exists
- [x] No accidental file deletions detected
- [x] No untracked files left behind

## Self-Check: PASSED
