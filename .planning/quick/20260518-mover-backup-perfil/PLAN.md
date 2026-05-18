---
slug: mover-backup-perfil
status: in-progress
created: 2026-05-18
---

# Mover Backup/Restore e Zona de Perigo para página "Meus Dados"

**Descrição:** Mover os cards de Backup e Restauração e Zona de Perigo da página de perfil (`/perfil`) para uma nova página dedicada ("Meus Dados" em `/meus-dados`).

## Tasks

1. Criar `src/app/meus-dados/page.tsx` com os cards de Backup/Restore e Zona de Perigo (extraídos do perfil)
2. Remover os cards de Backup/Restore e Zona de Perigo de `src/app/perfil/page.tsx`
3. Adicionar link "Meus Dados" no dropdown do avatar em `AppLayout.tsx`
4. Atualizar STATE.md e commitar
