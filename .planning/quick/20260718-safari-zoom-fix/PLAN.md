---
slug: safari-zoom-fix
description: "Adicionar CSS para prevenir zoom no Safari ao focar em inputs, selects e textarea"
status: complete
created: 2026-07-18
---

## Objetivo

Prevenir o zoom automático do Safari (iOS) ao selecionar inputs, selects e textarea.

## Solução

Adicionar `font-size: 16px` para `input`, `select`, `textarea` no globals.css. O Safari no iOS aplica zoom quando o font-size do elemento focalizado é menor que 16px.

## Arquivos modificados

- `src/app/globals.css` — regra adicionada no `@layer base`
