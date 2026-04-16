# External Integrations

**Analysis Date:** 2026-04-16

## APIs & External Services

**None detected.** This is a fully offline-first application with no external API integrations.

## Data Storage

**Local Database:**
- IndexedDB via Dexie 4.2.1
  - Database name: `agenda-barbearia`
  - Tables: `clientes`, `servicos`, `usuarios`, `agendamentos`, `transacoes`
  - Indexes defined on: `id`, `nome`, `telefone`, `createdAt`, `updatedAt`, `dataHora`, `status`, `clienteId`, `servicoId`, `agendamentoId`, `duracaoMinutos`, `preco`, `inicio`, `fim`, `intervaloInicio`, `intervaloFim`
  - Version: 2

**File Storage:**
- Local only - no cloud storage integration

**Caching:**
- @tanstack/react-query 5.91.3 - In-memory caching for API/state
- Service Worker runtime caching via @serwist/next

## Authentication & Identity

**None.** The application does not implement authentication.

- All data is stored locally in IndexedDB
- No login/signup flow (registration page `src/app/register/page.tsx` exists but appears to be for local user setup, not external auth)
- No OAuth, JWT, or session management
- No password hashing observed

## PWA Integration

**Service Worker:**
- @serwist/next 9.2.3 - Service Worker generation for Next.js
- Configured in `next.config.ts` with:
  - swSrc: `src/app/sw.ts`
  - swDest: `public/sw.js`
  - reloadOnOnline: false
  - Disabled in development mode

**Web App Manifest:**
- Location: `src/app/manifest.ts`
- App name: NoteBarber
- Display: standalone
- Orientation: portrait
- Language: pt-BR
- Theme color: #ff592c
- Background color: #ffffff
- Icons: `/logoapp.png` (252x252)
- Shortcuts: "Novo Agendamento" quick action

## Monitoring & Observability

**None.**
- No error tracking service (no Sentry, LogRocket, etc.)
- No analytics (no Google Analytics, Mixpanel, etc.)
- Console logging via custom Logger (`src/core/utils/Logger.ts`)

## CI/CD & Deployment

**Hosting:**
- Cloudflare Pages (via @opennextjs/cloudflare)
- Build scripts:
  - `build:worker`: `npx @opennextjs/cloudflare build`
  - `deploy:worker`: `npx @opennextjs/cloudflare deploy`
- Serve script: `npx serve@latest out` (for local production preview)

**CI Pipeline:**
- None detected - no GitHub Actions, GitLab CI, etc.

## Environment Configuration

**Environment handling:**
- No `.env` files detected
- Configuration appears hardcoded in components
- No environment variable usage for API keys or external services

**Secrets:**
- No secrets required (fully offline)

## Webhooks & Callbacks

**None.**
- No incoming webhooks
- No outgoing webhooks
- No external service integrations requiring callbacks

## Sync & Backup

**Local backup:**
- BackupService exists (`src/core/services/BackupService.ts`)
- UsesBackup hook (`src/hooks/useBackup.ts`)
- Export/import likely handled locally (JSON/file download)

---

*Integration audit: 2026-04-16*