# Coding Conventions

**Analysis Date:** 2026-04-16

## Naming Patterns

**Files:**
- PascalCase for components: `AgendamentoCard.tsx`, `ClienteFormDrawer.tsx`
- camelCase for hooks: `useAgendamento.ts`, `useBase.ts`
- camelCase for services: `BaseService.ts`, `AgendamentoService.ts`
- PascalCase for models: `Agendamento.ts`, `Cliente.ts`
- camelCase for utilities: `utils.ts`, `Logger.ts`

**Functions:**
- camelCase for functions: `getStatusConfig()`, `handleSave()`, `buscarHorarios()`
- Named exports for components and hooks: `export function Button()`, `export function useAgendamento()`
- Verb + noun pattern for handlers: `handleClienteSuccess()`, `handleDragEnd()`, `handleSave()`

**Variables:**
- camelCase for variables: `const isEditing`, `const loading`, `const clienteId`
- Descriptive names: `agendamentosDetalhes`, `horariosDisponiveis`, `openClienteCombobox`
- Underscore prefix for internal state: `_data`, `_hora` (not observed)

**Types:**
- PascalCase for type names: `AgendamentoStatus`, `AgendamentoCardProps`, `BaseModel`
- Type alias with descriptive names: `AgendamentoComDetalhes`, `BaseFilters<T>`

## Code Style

**Formatting:**
- Tool: Prettier (via Tailwind CSS v4 postcss plugin)
- Indentation: 2 spaces
- Quotes: Double quotes for JSX, single quotes for JavaScript strings

**Linting:**
- Tool: ESLint v9 with `eslint-config-next`
- Configuration: `eslint.config.mjs` using flat config
- Presets: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## TypeScript Usage

**Strict Mode:**
- Enabled in `tsconfig.json`: `"strict": true`
- Compiler target: ES2017
- Module resolution: bundler

**Path Aliases:**
- Root alias: `@/*` maps to `./src/*`
- Example: `import { Button } from "@/components/ui/button"`

**Type Annotations:**
- Function parameters: Explicitly typed
- React component props: Interface-based
- Generic patterns: `BaseService<T extends BaseModel>`

## Component Structure

**Page Components:**
- Location: `src/app/[page]/page.tsx`
- Server components by default, `"use client"` for interactivity
- Import UI from `@/components/ui/*`

**Form Components:**
- Pattern: Drawer/Dialog-based forms
- Example: `AgendamentoFormDrawer.tsx` with internal state
- Props interface defined separately

**UI Components:**
- Location: `src/components/ui/*`
- Pattern: Compound components with multiple exports
- Example: `Button` and `buttonVariants` from `button.tsx`
- Uses Radix UI primitives (@radix-ui/*)

## React Patterns

**Hooks:**
- Custom hooks in `src/hooks/`: `useAgendamento.ts`, `useBase.ts`
- Composition pattern: `useBase` provides CRUD, specialized hooks extend it
- React Query v5 for data fetching: `useQuery`, `useMutation`

**State Management:**
- Local state: `useState` for form fields and UI
- Server state: React Query with `queryClient.invalidateQueries()`
- Memoization: `useMemo` for filtered/transformed items

**Event Handlers:**
- Async handlers with try/catch/finally
- Example from `AgendamentoFormDrawer.tsx`:
```typescript
const handleSave = async () => {
  if (!clienteId || !servicoId || !data || !hora) {
    toast.warning("Por favor, preencha todos os campos.");
    return;
  }
  setLoading(true);
  try {
    // ... async operations
  } catch (error) {
    console.error("Erro ao salvar:", error);
    toast.error(error instanceof Error ? error.message : "Erro desconhecido");
  } finally {
    setLoading(false);
  }
};
```

**Effects:**
- `useEffect` for initialization and cleanup
- Pattern from `AgendamentoFormDrawer.tsx`:
```typescript
useEffect(() => {
  if (!open) {
    const timer = setTimeout(() => { /* reset */ }, 300);
    return () => clearTimeout(timer);
  }
}, [open]);
```

## Import Organization

**Order:**
1. React imports: `"use client";`, `import React from "react";`
2. Internal components: `import { Button } from "@/components/ui/button";`
3. Custom hooks: `import { useAgendamento } from "@/hooks/useAgendamento";`
4. Services: `import { AgendamentoService } from "@/core/services/AgendamentoService";`
5. Models: `import { Agendamento } from "@/core/models/Agendamento";`
6. Libraries: `import { cn } from "@/lib/utils";`, `import { toast } from "sonner";`
7. Icons: `import { Check, Clock } from "lucide-react";`

**Path Aliases:**
- UI components: `@/components/ui/*`
- Hooks: `@/hooks/*`
- Core: `@/core/*`
- Library: `@/lib/*`

## Error Handling

**Service Layer:**
- Try/catch in all async methods
- Custom Logger utility: `Logger.error()`, `Logger.info()`, `Logger.warn()`
- Example from `BaseService.ts`:
```typescript
async list(): Promise<T[]> {
  try {
    return await this.table.toArray();
  } catch (error) {
    Logger.error(`Falha ao listar dados da tabela ${this.tableName}`, error);
    throw error;
  }
}
```

**UI Layer:**
- Toast notifications: `toast.success()`, `toast.error()`, `toast.warning()`
- Component validation before submit
- Error boundary pattern not observed

**Logger Configuration:**
- Located in `src/core/utils/Logger.ts`
- Development-only logging for `info()` and `warn()`
- Always logs errors
- Uses styled console output (color-coded)

## Logging

**Framework:** Custom Logger utility (`src/core/utils/Logger.ts`)

**Patterns:**
- Info logs for successful operations
- Error logs with stack trace
- Warnings for potential issues
- Conditional in development: `process.env.NODE_ENV === 'development'`

**Example:**
```typescript
Logger.info(`Item ${id} atualizado na tabela ${this.tableName}`);
Logger.error(`Erro ao criar item na tabela ${this.tableName}`, error);
```

## Comments

**When to Comment:**
- Complex logic in handlers
- TypeScript interfaces above definitions
- No JSDoc observed in source files

**JSDoc/TSDoc:**
- Not actively used in this codebase

## Function Design

**Size:** Components tend to be large (400+ lines) for complex forms

**Parameters:**
- Props interface pattern
- Destructured in function signature

**Return Values:**
- Explicit return types for services
- JSX for components

## Module Design

**Exports:**
- Named exports for components and hooks
- Re-exported from service files
- Example: `AgendamentoComDetalhes` from service file

**Barrel Files:**
- Not actively used
- Direct imports from modules preferred

## CSS/Tailwind Patterns

**Styling Approach:**
- Tailwind CSS v4
- class-variance-authority (CVA) for component variants
- Pattern from `button.tsx`:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ...",
  {
    variants: {
      variant: { default: "...", destructive: "...", outline: "..." },
      size: { default: "...", sm: "...", lg: "..." }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);
```

**Merge Utility:**
- `cn()` from `@/lib/utils` combines classnames with tailwind-merge

---

*Convention analysis: 2026-04-16*