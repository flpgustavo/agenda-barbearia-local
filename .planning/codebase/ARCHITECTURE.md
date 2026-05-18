# Architecture

**Analysis Date:** 2026-04-16

## Pattern Overview

**Overall:** Service-Layer with React Query Pattern

The application follows a **layered service architecture** with clear separation between database abstraction, business logic, and UI state management. Data flows unidirectionally from Dexie (IndexedDB) → BaseService → Domain Service → React Hook → Component.

## Layers

### 1. Database Layer: Dexie (IndexedDB)

**Location:** `src/core/db/index.ts`

The database uses Dexie.js wrapper for IndexedDB, configured with a schema version and table definitions:

```typescript
export class Database extends Dexie {
    clientes!: Table<Cliente, string>;
    servicos!: Table<Servico, string>;
    usuarios!: Table<Usuario, string>;
    agendamentos!: Table<Agendamento, string>;
    transacoes!: Table<Transacao, string>;
}
```

Tables are typed by models at `src/core/models/*.ts` with compound indexes (e.g., `"clienteId, dataHora, status"`).

### 2. Model Layer: TypeScript Interfaces

**Location:** `src/core/models/`

**Base Interface:** `src/core/models/BaseModel.ts`

```typescript
export interface BaseModel {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}
```

Domain models extend BaseModel:
- `Cliente.ts` - `nome`, `telefone`
- `Servico.ts` - `nome`, `duracaoMinutos`, `preco`
- `Agendamento.ts` - `clienteId`, `servicoId`, `dataHora`, `status`
- `Transacao.ts` - `agendamentoId`, `dataHora`, `status`, `valor`
- `Usuario.ts` - barber profile with `inicio`, `fim`, `intervaloInicio`, `intervaloFim`

### 3. Service Layer: Business Logic

**Location:** `src/core/services/`

#### BaseService (`src/core/services/BaseService.ts`)

Generic CRUD operations for all entities:

```typescript
export class BaseService<T extends BaseModel> {
    protected table: Dexie.Table<T, string>;
    
    async list(): Promise<T[]>
    async get(id: string): Promise<T | undefined>
    async create(data): Promise<string>  // generates UUID + timestamps
    async update(id, data): Promise<void>
    async remove(id): Promise<void>
}
```

All services inherit from BaseService and add domain-specific validation.

#### Domain Services

**ClienteService** (`src/core/services/ClienteService.ts`)
- Validates client deletion (blocks if active appointments exist)

**ServicoService** (`src/core/services/ServicoService.ts`)
- Inherits BaseService (no custom logic observed)

**AgendamentoService** (`src/core/services/AgendamentoService.ts`)
- Complex scheduling validation:
  - Checks business hours (inicio/fim from Usuario)
  - Validates lunch interval conflicts
  - Prevents double-booking
  - Enforces service duration bounds

- Computes availability windows:
  - `gerarHorariosDisponiveis(dataStr, duracaoMinutos)` - generates available time slots
  - `verificarDisponibilidadeDia(data)` - checks if any slot exists

- Joins related data: `listWithDetails()` returns `AgendamentoComDetalhes` with embedded `cliente` and `servico` objects.

**UsuarioService** (`src/core/services/UsuarioService.ts`)
- Single-user profile management (barber shop owner)

**TransacaoService** (`src/core/services/TransacaoService.ts`)
- Records payment events linked to appointments

**BackupService** (`src/core/services/BackupService.ts`)
- Export/import database as encrypted JSON

### 4. Hook Layer: React Query Integration

**Location:** `src/hooks/`

#### useBase (`src/hooks/useBase.ts`)

Generic React Query hook wrapping BaseService:

```typescript
export function useBase<T extends BaseModel>(
    service: BaseService<T>,
    queryKey: QueryKey,
    options?: UseBaseOptions<T>
) {
    // useQuery for list()
    // useMutation for create/update/delete
    // Automatic query invalidation on mutations
    
    return { items, rawItems, loading, error, criar, atualizar, remover, recarregar }
}
```

Wraps service methods and manages React Query cache invalidation automatically.

#### Domain Hooks

Each domain has a specialized hook extending useBase:

- `useCliente()` - uses `ClienteService`
- `useServico()` - uses `ServicoService`
- `useUsuario()` - uses `UsuarioService`
- `useTransacao()` - uses `TransacaoService`
- `useAgendamento()` - uses `AgendamentoService` + custom availability methods
- `useDashboardAgendamentos(filters)` - aggregates appointment data for dashboard metrics

### 5. UI Layer: Next.js App Router Pages

**Location:** `src/app/**/*.tsx`

Standard Next.js 14 App Router structure:
- `layout.tsx` - root layout with ThemeProvider, QueryProvider
- `page.tsx` - route handlers
- `page.tsx` file per route segment

Routes:
- `/` → `src/app/page.tsx` - onboarding/home (redirects to dashboard if configured)
- `/register` → `src/app/register/page.tsx` - first-time setup
- `/dashboard` → `src/app/dashboard/page.tsx` - KPI dashboard
- `/agendamentos` → `src/app/agendamentos/page.tsx` - calendar view
- `/clientes` → `src/app/clientes/page.tsx` - client list
- `/servicos` → `src/app/servicos/page.tsx` - service management
- `/transacoes` → `src/app/transacoes/page.tsx` - transaction history
- `/perfil` → `src/app/perfil/page.tsx` - barber profile settings

## Data Flow

### Flow 1: Reading Appointments

1. Component calls `agendamentos()` from `useAgendamento()` hook
2. Hook invokes `AgendamentoService.listWithDetails()`
3. Service queries IndexedDB via Dexie + joins cliente/servico
4. React Query returns cached or fresh data
5. Component renders `AgendamentoCard` components

### Flow 2: Creating Appointment

1. User fills form, submits to `useAgendamento().criar(data)`
2. Hook wraps in `useMutation`
3. `AgendamentoService.create()` validates:
   - Client exists
   - Service exists
   - Within business hours
   - No conflicts with existing appointments
4. On success: `queryClient.invalidateQueries()` triggers refetch
5. Calendar re-renders with new appointment

### Flow 3: Dashboard Metrics

1. `useDashboardAgendamentos(filters)` fetches all appointments via React Query
2. Memoized computations transform raw data:
   - `receitaPorDiaSemana` - revenue by weekday
   - `topClientes` - ranked client spending
   - `frequenciaRetorno` - return frequency analysis
   - `lifetimeClientes` - customer retention stages
3. Components consume derived metrics directly

## State Management

**Primary:** React Query (@tanstack/react-query)

- **Query Keys:** Centralized in `src/lib/queryKeys.ts`
  ```typescript
  export const queryKeys = {
    clientes: ['clientes'],
    servicos: ['servicos'],
    usuarios: ['usuarios'],
    transacoes: ['transacoes'],
    agendamentos: ['agendamentos'],
    agendamentosDetalhes: ['agendamentos', 'detalhes'],
  }
  ```

- **Query Invalidation:** Services auto-invalidate on mutations via `onSuccess` callbacks

- **Caching:** Default staleTime (5 min) - data persists in memory

**Secondary:** Local Component State

- `useState` for form inputs and UI toggles (drawers, dialogs)
- `useMemo` for derived data (filtered lists, sorted arrays)
- `useCallback` for memoized event handlers

**No global store (Zustand/Redux)** - all state handled via React Query + local hooks.

## Error Handling

**Strategy:** Service-layer error throwing + hook-level message extraction

Services throw descriptive errors:
```typescript
throw new Error("Horário já ocupado por outro agendamento.");
```

Hooks extract error messages:
```typescript
const error = queryError ? (queryError as Error).message : null;
```

Components display via `sonner.toast`:
```typescript
toast.error('Erro ao remover agendamento')
```

Logging: `src/core/utils/Logger.ts` logs service operations with timestamps.

## Entry Points

**Root Layout:** `src/app/layout.tsx`

Wraps all routes with:
- `ThemeProvider` (dark/light mode)
- `QueryProvider` (React Query client)
- `AppLayout` (navigation shell)
- `Toaster` (sonner notifications)

**Onboarding:** `src/app/page.tsx`

- If no user exists → shows register/import options
- If user exists → redirects to `/dashboard`

## Cross-Cutting Concerns

**Data Validation:**
- Services validate business rules before mutations
- UI validates form input format

**Date Handling:**
- `date-fns` library throughout
- ISO strings stored in IndexedDB (e.g., `"2026-04-16T14:30:00"`)
- Locale: `ptBR`

**Form Interaction:**
- Shadcn UI components + custom Drawer forms
- Optimistic UI updates on some mutations (e.g., appointment completion)

**Backup/Restore:**
- Encrypted JSON export/import via `BackupService`
- AES encryption with user-provided password

---

*Architecture analysis: 2026-04-16*