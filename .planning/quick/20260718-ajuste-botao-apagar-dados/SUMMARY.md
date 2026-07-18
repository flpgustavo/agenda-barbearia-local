---
slug: ajuste-botao-apagar-dados
status: complete
completed: 2026-07-18
commit: 41f9820
---

# Ajustar botão "Apagar Tudo" para preservar perfil do usuário

## Summary

Modified `BackupService.reset()` to clear only operational tables (`clientes`, `servicos`, `agendamentos`, `transacoes`) while preserving `usuarios`. Updated UI text in the "Zona de Perigo" card to reflect that only barbearia data is removed and the profile stays intact.

## Files Changed

- `src/core/services/BackupService.ts` — removed `usuarios.clear()`, added `transacoes.clear()`
- `src/app/meus-dados/MeusDadosPage.tsx` — updated button text, descriptions, and toast message
- `.planning/STATE.md` — added quick task entry
- `.planning/quick/20260718-ajuste-botao-apagar-dados/PLAN.md` — plan file
