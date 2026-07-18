---
slug: ajuste-botao-apagar-dados
status: in-progress
created: 2026-07-18
---

# Ajustar botão "Apagar Tudo" para preservar perfil do usuário

**Descrição:** Modificar o botão "Apagar Tudo" na página "Meus Dados" para limpar apenas dados operacionais (clientes, serviços, agendamentos, transações) sem apagar o perfil do usuário, mantendo-o logado.

## Tasks

1. Modificar `BackupService.reset()` para limpar apenas `clientes`, `servicos`, `agendamentos`, `transacoes` — preservar `usuarios`
2. Atualizar textos na UI da "Zona de Perigo" (título e descrição) para refletir que apenas dados da barbearia são removidos
3. Commitar e atualizar STATE.md
