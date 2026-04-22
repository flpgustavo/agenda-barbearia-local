# Phase 4.1 Research: Tutorial Overlay — Criação de Entidades

**Gathered:** 22/04/2026
**Status:** Ready for planning
**Phase:** 4.1 — Tutorial de Criação de Entidades

---

## Domain Analysis

### What This Phase Delivers

A `TutorialOverlay` component that guides new users through creating their first Cliente (client), Servico (service), and Agendamento (appointment) — using a step-by-step Dialog-based overlay.

### Key Technical Decisions

#### 1. Overlay Pattern — Radix UI Dialog (NOT Custom Overlay)

**Decision:** Use Radix UI Dialog as the foundation, NOT a custom overlay.

**Rationale:**
- `src/components/ui/dialog.tsx` already exports Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription
- Radix Dialog provides accessible focus management, backdrop click-to-close, Escape key handling
- `framer-motion` is available (v12.23.26) for smooth enter/exit animations
- `vaul` (v1.1.2) is also available but is drawer-specific — not appropriate for centered modal overlays

**Architecture:**
```
TutorialOverlay (dialog wrapper)
  ├── StepContent (dialog body per step)
  ├── StepIndicator (progress dots/steps)
  └── StepNavigation (Prev/Next/Finish buttons)
```

#### 2. Tutorial State Persistence — localStorage

**Decision:** Store per-step completion in `localStorage` under `agenda_tutorial_v1`.

**Rationale:**
- No localStorage currently exists in the codebase — this is the first use
- localStorage persists across sessions (vs sessionStorage which clears on tab close)
- Key format: `agenda_tutorial_v1` → JSON with `{ completed: boolean, stepIndex: number, lastSeen: timestamp }`
- Per-entity completion flags: `cliente_seen`, `servico_seen`, `agendamento_seen`

**Implementation pattern:**
```typescript
// src/hooks/useTutorial.ts
const TUTORIAL_KEY = 'agenda_tutorial_v1';

export function useTutorial() {
  const [state, setState] = useState<TutorialState>(() => {
    if (typeof window === 'undefined') return initialState;
    const stored = localStorage.getItem(TUTORIAL_KEY);
    return stored ? JSON.parse(stored) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(TUTORIAL_KEY, JSON.stringify(state));
  }, [state]);

  // Returns: isStepComplete(key), completeStep(key), resetTutorial()
}
```

#### 3. Step Content Structure

**Decision:** Steps are configured via a `TUTORIAL_STEPS` constant array.

**Structure:**
```typescript
type TutorialStep = {
  id: string;           // 'cliente', 'servico', 'agendamento'
  title: string;
  description: string;
  targetPage: string;   // '/clientes', '/servicos', '/agendamentos'
  action: string;      // 'Criar primeiro cliente'
  completed: boolean; // checked via localStorage
};
```

**Steps:**
1. **Criar Cliente** (`/clientes`) — Click the FAB (+) button, fill ClienteFormDrawer
2. **Criar Serviço** (`/servicos`) — Click the FAB (+), fill ServicoFormDrawer
3. **Criar Agendamento** (`/agendamentos`) — Click "Novo" on any day, fill AgendamentoFormDrawer

#### 4. Integration Points (Pages)

Each entity page needs a TutorialTrigger:

- `src/app/clientes/page.tsx` — Check if tutorial state shows `cliente` step, render TutorialOverlay
- `src/app/servicos/page.tsx` — Same pattern
- `src/app/agendamentos/page.tsx` — Same pattern

**Integration pattern:**
```typescript
// In each entity page:
const tutorial = useTutorial();

// Only show if current tutorial step matches this entity
const isThisStep = tutorial.currentStep?.id === 'cliente'; // (entity-specific)

// Show overlay on mount if step is pending
useEffect(() => {
  if (isThisStep && !tutorial.isStepComplete('cliente')) {
    tutorial.showStep('cliente');
  }
}, [isThisStep, tutorial]);
```

#### 5. Step Navigation Flow

```
Step 1: Cliente
  └─ "Criar Cliente" button → opens ClienteFormDrawer
  └─ onDrawerClose → mark step complete → advance to Step 2

Step 2: Serviço
  └─ "Criar Serviço" button → opens ServicoFormDrawer
  └─ onDrawerClose → mark step complete → advance to Step 3

Step 3: Agendamento
  └─ "Criar Agendamento" button → opens AgendamentoFormDrawer
  └─ onDrawerClose → mark step complete → tutorial ends
```

#### 6. Skip / Dismiss Pattern

- Each dialog has a "Pular tutorial" text link (small, muted)
- Clicking skips remaining steps and marks all as complete
- "Rever tutorial" accessible from Profile page (`/perfil`)

---

## Architecture Pattern (per phase 2-3 SUMMARYs)

From Phase 2-3:
- Components go in `src/components/` subdirectories (e.g., `src/components/transacoes/`)
- Hooks go in `src/hooks/`
- Pages modify existing files (add imports, add state, add rendering)
- No new API routes needed — all data is local Dexie/IndexedDB
- TypeScript interfaces defined in `src/core/models/`

---

## Don'ts

- **Do NOT use a custom modal overlay** — use Radix Dialog
- **Do NOT hardcode step state in components** — use the `useTutorial` hook
- **Do NOT clear localStorage on logout** — tutorial completion should persist
- **Do NOT skip type definitions** — `TutorialStep`, `TutorialState` interfaces required

---

## Validation Architecture

Steps to verify the tutorial works:
1. Clear `agenda_tutorial_v1` from localStorage
2. Visit `/clientes` — TutorialOverlay should appear for step 1
3. Click "Criar Cliente" — ClienteFormDrawer opens
4. Close the drawer (without creating) — Step remains active
5. Create a client — step marked complete, step 2 shown
6. Complete all 3 steps — localStorage reflects `completed: true`
7. Visit `/clientes` again — No tutorial shown (all steps complete)

---

## Common Pitfalls

1. **Dialog focus trap conflicts with FormDrawer** — Both Radix Dialog and FormDrawer use focus trapping. Solution: Use Radix AlertDialog for the tutorial (supports destructive/confirm actions) OR ensure FormDrawer is closed before showing tutorial.
2. **Multiple tutorial instances** — TutorialOverlay should only render once per page load. Use a singleton pattern or check existing state.
3. **Server-side rendering (localStorage)** — Always guard with `typeof window !== 'undefined'` check. useEffect is safe; initial state must guard.

---

## Sources

- `src/components/ui/dialog.tsx` — Existing Radix Dialog components
- `src/app/clientes/page.tsx` — ClienteFormDrawer pattern (drawer integration)
- `src/app/clientes/ClienteFormDrawer.tsx` — Drawer component to target
- `src/hooks/useBase.ts` — Hook pattern for this codebase
- `src/core/models/Cliente.ts` — Entity model
- `src/app/page.tsx` — Home page, router.push for navigation
- `package.json` — framer-motion v12.23.26 available for animations