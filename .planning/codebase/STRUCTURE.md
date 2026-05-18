# Codebase Structure

**Analysis Date:** 2026-04-16

## Directory Layout

```
agenda-barbearia/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Shadcn UI primitives
│   │   └── layout/              # Layout components
│   ├── core/                   # Domain layer
│   │   ├── db/                 # Database configuration
│   │   ├── models/             # TypeScript interfaces
│   │   ├── services/           # Business logic services
│   │   └── utils/              # Core utilities (logger, crypto)
│   ├── hooks/                  # React hooks (React Query wrappers)
│   └── lib/                    # Shared utilities and config
├── cypress/                    # E2E tests
└── .planning/codebase/           # This document
```

## Directory Purposes

### `src/app/` - Next.js App Router

**Purpose:** Page components and routing

**Structure:**
```
src/app/
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── page.tsx              # Home/onboarding
├── register/
│   └── page.tsx          # First-time user setup
├── dashboard/
│   ├── page.tsx           # Dashboard KPIs
│   └── DateRangeFilter.tsx
├── agendamentos/
│   ├── page.tsx          # Calendar view
│   ├── AgendamentoCard.tsx
│   ├── AgendamentoDetail.tsx
│   └── AgendamentoFormDrawer.tsx
├── clientes/
│   ├── page.tsx
│   └── ClienteFormDrawer.tsx
├── servicos/
│   ├── page.tsx
│   └── ServicoFormDrawer.tsx
├── transacoes/
│   ├── page.tsx
│   └── TransacaoFormDrawer.tsx
├── perfil/
│   └── page.tsx
├── sw.ts                 # Service worker
├── manifest.ts           # Manifest for PWA
```

**Key Files:**
- `layout.tsx`: Root layout with providers
- `page.tsx`: Route entry point

### `src/core/` - Domain Layer

**Purpose:** All business logic and data infrastructure

**Subdirectories:**

#### `src/core/db/` - Database

- `index.ts`: Dexie database class with schema and table definitions
- `seeder.ts`: Database seeding logic (not actively used)

**Location:** `src/core/db/index.ts`

```typescript
export class Database extends Dexie {
    clientes!: Table<Cliente, string>;
    servicos!: Table<Servico, string>;
    usuarios!: Table<Usuario, string>;
    agendamentos!: Table<Agendamento, string>;
    transacoes!: Table<Transacao, string>;
}
```

#### `src/core/models/` - TypeScript Interfaces

**Files:**
- `BaseModel.ts` - Base interface with `id`, `createdAt`, `updatedAt`
- `Cliente.ts` - Client entity
- `Servico.ts` - Service entity ( haircut types)
- `Agendamento.ts` - Appointment entity with status enum
- `Transacao.ts` - Transaction entity
- `Usuario.ts` - Barber user profile

**Pattern:** Each model extends `BaseModel` with domain-specific fields.

#### `src/core/services/` - Business Logic Services

**Files:**
- `BaseService.ts` - Generic CRUD (inherited by all)
- `ClienteService.ts` - Client operations + deletion validation
- `ServicoService.ts` - Service CRUD
- `AgendamentoService.ts` - Complex scheduling logic (319 lines - most complex)
- `TransacaoService.ts` - Transaction CRUD
- `UsuarioService.ts` - Barber profile
- `BackupService.ts` - Export/import functionality

**Pattern:** Each service exports a singleton instance (PascalCase service name).

#### `src/core/utils/` - Core Utilities

- `Logger.ts` - Typed logging utility
- `Crypto.ts` - Encryption utilities

### `src/hooks/` - React Hooks

**Purpose:** React Query integration for each domain

**Files:**
- `useBase.ts` - Generic hook wrapping BaseService
- `useCliente.ts` - Client domain hook
- `useServico.ts` - Service domain hook
- `useUsuario.ts` - User profile hook
- `useTransacao.ts` - Transaction hook
- `useAgendamento.ts` - Appointment hook + availability methods
- `useBackup.ts` - Backup hook
- `useDashboardAgendamentos.ts` - Dashboard aggregations
- `useLongPress.ts` - UI utility hook

**Pattern:** Each hook wraps a service instance + React Query.

### `src/components/` - UI Components

**Subdirectories:**

#### `src/components/ui/` - Shadcn UI Components

Generated shadcn/ui components:
- `button.tsx`, `input.tsx`, `select.tsx`
- `card.tsx`, `dialog.tsx`, `drawer.tsx`
- `sheet.tsx`, `popover.tsx`
- `table.tsx`, `badge.tsx`, `avatar.tsx`
- `scroll-area.tsx`, `skeleton.tsx`
- ...and others (~30+ components)

#### `src/components/layout/` - Layout

- `AppLayout.tsx` - Navigation shell

#### `src/components/`

- `QueryProvider.tsx` - React Query provider
- `theme-provider.tsx` - Dark mode provider

### `src/lib/` - Shared Utilities

- `queryKeys.ts` - React Query key constants
- `utils.ts` - `cn()` class merger (clsx + tailwind-merge)

## File Naming Conventions

### Pages

- `page.tsx` - Next.js route component
- Named by route segment (e.g., `agendamentos/page.tsx` for `/agendamentos`)

### Components

- **PascalCase** for React components:
  - `AgendamentoCard.tsx`
  - `ClienteFormDrawer.tsx`
  - `DateRangeFilter.tsx`
- **CamelCase** for hook files:
  - `useAgendamento.ts`
  - `useDashboardAgendamentos.ts`

### Services

- **PascalCase** with `Service` suffix:
  - `BaseService.ts`
  - `AgendamentoService.ts`
  - Exports singleton: `export const AgendamentoService = new AgendamentoServiceClass()`

### Models

- **PascalCase** with entity name:
  - `Agendamento.ts`
  - `Cliente.ts`
  - Extension: `.ts` (interfaces, not classes)

### Hooks

- **camelCase** with `use` prefix:
  - `useAgendamento.ts`
  - `useBase.ts`
- Custom UI hooks without `use`:
  - `useLongPress.ts`

### Utilities

- **PascalCase** for utilities:
  - `Logger.ts`
  - `Crypto.ts`
- **camelCase** for lib functions:
  - `utils.ts` (exports `cn()`)

## Where to Add New Code

### New Feature / Route

1. **Page**: Create directory under `src/app/[feature]/page.tsx`
2. **Form drawer**: Create `src/app/[feature]/[Feature]FormDrawer.tsx`
3. **Model**: Add interface to `src/core/models/[Feature].ts`
4. **Service**: Create `src/core/services/[Feature]Service.ts` (extends BaseService)
5. **Hook**: Create `src/hooks/use[Feature].ts` (wraps service)
6. **Query keys**: Add to `src/lib/queryKeys.ts`

Example structure:
```
src/app/clientes/page.tsx          # Route
src/app/clientes/ClienteFormDrawer.tsx
src/core/models/Cliente.ts
src/core/services/ClienteService.ts
src/hooks/useCliente.ts
src/lib/queryKeys.ts                # Add: clientes: ['clientes']
```

### New Component

- **Co-located with page**: `src/app/agendamentos/AgendamentoCard.tsx`
- **Reusable UI**: `src/components/ui/[ComponentName].tsx`
- **Layout**: `src/components/layout/[ComponentName].tsx`

### New Utility

- **Domain-specific**: `src/core/utils/[UtilityName].ts`
- **Shared**: `src/lib/utils.ts`

### New Service Method

- Add to domain service in `src/core/services/[Feature]Service.ts`
- Expose via hook in `src/hooks/use[Feature].ts`
- Invalidate queries on mutation

### New Dashboard Metric

- Add computation to `src/hooks/useDashboardAgendamentos.ts`
- Return in hook's object
- Consume in `src/app/dashboard/page.tsx`

## Routing Conventions

### App Router Pattern

Next.js 14 App Router with **file-system routing**:

- `src/app/page.tsx` → `/`
- `src/app/dashboard/page.tsx` → `/dashboard`
- `src/app/agendamentos/page.tsx` → `/agendamentos`
- `src/app/clientes/page.tsx` → `/clientes`
- `src/app/servicos/page.tsx` → `/servicos`
- `src/app/transacoes/page.tsx` → `/transacoes`
- `src/app/perfil/page.tsx` → `/perfil`

### Route Organization

Routes grouped by entity:
- Dashboard routes under `/dashboard`
- CRUD routes: `/agendamentos`, `/clientes`, `/servicos`, `/transacoes`
- Settings: `/perfil`

### URL Params

Not heavily used - primary state via:
- Query params (e.g., `?action=novo` in appointment creation)
- No dynamic segments like `/agendamentos/[id]` - details rendered via drawer/dialog

### Navigation

Client-side navigation via `Link` from `next/link` + programmatic `useRouter` push.

---

*Structure analysis: 2026-04-16*