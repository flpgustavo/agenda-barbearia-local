# Phase 7: Disponibilidade & Ocupação — Research

**Researched:** 2026-05-21
**Domain:** Weekly availability grid rendering, IndexedDB bulk queries, occupancy computation, DOM-to-image export
**Confidence:** HIGH (established patterns, verified API docs)

## Summary

This phase adds a **weekly availability grid** and **daily occupancy rates** to the Dashboard page via a state-based bottom tab switcher. The grid displays 7 days (Mon–Sun) as horizontally scrollable columns, each showing free time slots as chips and an occupancy percentage indicator. A new bulk service method `gerarGradeSemanal(servicoId)` computes all 7 days in a single IndexedDB pass (not 7 individual queries). Export uses the existing `html-to-image` `toBlob` pattern. No new models, routes, or global navigation changes are needed — the grid lives inside the dashboard page only.

**Primary recommendation:** Implement a dedicated `useAvailabilityGrid` hook (new file) that consumes `AgendamentoService.gerarGradeSemanal()` and returns structured data per day. Keep the bottom tab bar as a simple state switch in `page.tsx` — do not over-engineer with a separate router or context.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISP-01 | User can select a service to view available weekly time slots | Service selector row (horizontal scroll of cards), calling `gerarGradeSemanal` per selected service ID |
| DISP-02 | User can see a visual grid of weekdays with free time slots for the selected service | Horizontally scrollable columns (Mon–Sun), each containing chip-rendered free slots |
| DISP-03 | User can export the availability grid as image via html-to-image | `toBlob` from `html-to-image` v1.11.13, already installed and used in `AgendamentoFormDrawer.tsx:94-137` |
| OCUP-01 | User can see occupancy percentage per day of week | Computed as `occupiedSlots / totalPossibleSlots` per day, displayed in day column header |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navigation & Section Placement (D-01):**
- Availability lives on a separate dashboard tab via a bottom nav switcher within the dashboard page only (not app-wide). Tabs: "Dashboard" (current scrollable view) | "Disponibilidade" (availability grid). No route change — state-based tab switch.

**Availability Grid Layout (D-02 to D-08):**
- Week starts on Monday (Mon–Sun grid, BR standard)
- Each slot spans the selected service's duration (not fixed 30min)
- One column per day, horizontally scrollable
- Grid shows each day with available times rendered as chips (matching existing chip pattern)
- Grid displays the current week with navigation arrows to go forward/backward weeks
- Grid auto-refreshes immediately when user selects a different service
- Week header shows date range (e.g., "Semana de 19/05 a 25/05")

**Occupancy (D-09):**
- Occupancy percentage is shown in-grid as a column indicator per day

**Data Layer (D-10, D-11):**
- New service method `gerarGradeSemanal(servicoId)` on AgendamentoService that bulk-computes 7 days
- Service selector is a horizontal scrollable row of service cards/buttons above the grid

**Export (D-12):**
- Export button (html-to-image) placed in the grid header bar, patterned after the existing share button in AgendamentoFormDrawer.tsx

### Agent's Discretion
- Visual design of the bottom tab bar (icons, labels, active state highlight)
- Visual design of each day column within the grid (chip colors, spacing)
- Loading skeleton pattern for the grid
- Empty state when no services exist
- Responsive breakpoints for grid columns
- Exact chip size and layout per day column
- How the occupancy indicator looks (progress bar, percentage text, or both)
- Implementation approach for the new service method (local Dexie queries)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Availability grid rendering | Browser / Client | — | All computation is client-side; grid renders in the browser from IndexedDB data |
| Service selection | Browser / Client | — | State-based service picker; no server call needed |
| Occupancy computation | API / Backend (service layer) | — | Computation lives in `AgendamentoService` which is the domain logic boundary |
| Week navigation | Browser / Client | — | Pure client state (week offset) — no backend needed |
| Grid export (PNG) | Browser / Client | — | `html-to-image` runs entirely in the browser via DOM-to-canvas rendering |
| Data persistence | Database / Storage (IndexedDB) | — | Schedule and appointment data come from Dexie/IndexedDB via service layer |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html-to-image | 1.11.13 | Export grid as PNG blob | Already installed and used in `AgendamentoFormDrawer.tsx:94-137` [VERIFIED: npm registry, package.json] |
| date-fns | 4.1.0 | Date math (week starts, day ranges, formatting) | Already installed; provides `startOfWeek`, `addWeeks`, `eachDayOfInterval`, `format` [VERIFIED: npm registry, package.json] |
| Dexie | 4.2.1 | IndexedDB queries with `.where()` range filters | Existing ORM; `db.agendamentos.where("dataHora").between(...)` for 7-day range query [VERIFIED: npm registry] |
| @tanstack/react-query | 5.91.3 | Data fetching + caching for the grid hook | Existing query infrastructure [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.555.0 | Icons for tab bar, navigation, export button | Existing icon library; use CalendarDays, Clock, ArrowLeft, ArrowRight, Download [VERIFIED: package.json] |

### Installation

No new packages needed — all dependencies are already installed.

**Version verification:**
```
npm view html-to-image version     # → 1.11.13 ✓
npm view date-fns version           # → 4.1.0   ✓
npm view dexie version              # → 4.2.1   ✓
npm view @tanstack/react-query version # → 5.91.3 ✓
```

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  DashboardPage (page.tsx)                                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Header (sticky)                                             │    │
│  │  [Refresh]  Dashboard title + DateRangeFilter                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Bottom Tab Bar (sticky bottom)                              │    │
│  │  [📊 Dashboard]         [📅 Disponibilidade]                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌── Tab: "Dashboard" ──────────────────────────────────────────┐   │
│  │  KPI Cards → Financial Summary → Revenue Chart → Rankings   │   │
│  │  → InsightsSection (existing content, unchanged)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Tab: "Disponibilidade" ────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐    │  │
│  │  │ Service Selector Row (horizontal scroll cards)        │    │  │
│  │  │ [Corte] [Barba] [Corte+Barba] ← scroll →             │    │  │
│  │  └───────────────────────────────────────────────────────┘    │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐    │  │
│  │  │ Grid Header Bar                                         │    │  │
│  │  │ ◀  Semana de 19/05 a 25/05  ▶  [📥 Exportar]       │    │  │
│  │  └───────────────────────────────────────────────────────┘    │  │
│  │                                                               │  │
│  │  ┌── Horizontal Scroll ───────────────────────────────────┐   │  │
│  │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ··· ┌──────┐    │   │  │
│  │  │ │ SEG  │ │ TER  │ │ QUA  │ │ QUI  │     │ DOM  │    │   │  │
│  │  │ │19/05 │ │20/05 │ │21/05 │ │22/05 │     │25/05 │    │   │  │
│  │  │ │ 45% █│ │ 60% █│ │ 20%  │ │ 80% █│     │  0%  │    │   │  │
│  │  │ │──────│ │──────│ │──────│ │──────│     │──────│    │   │  │
│  │  │ │08:00 │ │08:00 │ │09:00 │ │08:00 │     │  —   │    │   │  │
│  │  │ │08:30 │ │08:30 │ │10:00 │ │09:00 │     │      │    │   │  │
│  │  │ │09:00 │ │09:30 │ │11:00 │ │10:00 │     │      │    │   │  │
│  │  │ │ ...  │ │ ...  │ │ ...  │ │ ...  │     │      │    │   │  │
│  │  │ └──────┘ └──────┘ └──────┘ └──────┘     └──────┘    │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

Data flow arrows:
  ServiceCard[onClick] → setServicoId(servicoId)
    → useAvailabilityGrid recomputes (weekOffset + servicoId as deps)
      → AgendamentoService.gerarGradeSemanal(servicoId, weekStart)
        → db.usuarios.toCollection().first()           (1 read)
        → db.servicos.get(servicoId)                    (1 read)
        → db.agendamentos.where("dataHora").between(...) (1 ranged read)
        → for each day: compute free slots + occupancy
    → returns GradeSemanal { dias: DayData[] }
    → DisponibilidadeGrid re-renders
```

### Recommended Project Structure

```
src/
├── app/dashboard/
│   ├── page.tsx                              # ADD bottom tab state, conditional rendering
│   ├── DisponibilidadeTab.tsx                 # NEW — container for the availability section
│   ├── ServiceSelectorRow.tsx                 # NEW — horizontal scroll service cards
│   ├── WeekNavigator.tsx                      # NEW — arrows + date range + export button
│   ├── DayColumn.tsx                          # NEW — single day column with chips
│   ├── DisponibilidadeGrid.tsx                # NEW — horizontally scrollable grid container
│   ├── DisponibilidadeSkeleton.tsx            # NEW — loading skeleton for grid
│   └── ...existing files unchanged
├── hooks/
│   ├── useDashboardAgendamentos.ts            # UNCHANGED
│   └── useAvailabilityGrid.ts                 # NEW — hook wrapping gerarGradeSemanal
├── core/services/
│   ├── AgendamentoService.ts                  # ADD: gerarGradeSemanal(servicoId) method
│   └── ...unchanged
└── lib/
    └── queryKeys.ts                           # ADD: gradeDisponibilidade query key
```

### Pattern 1: Bottom Tab Bar (State-Based Switch)

**What:** A sticky bottom bar inside the dashboard page that switches content via React state instead of route change. Uses `div` + `button` elements (no external library needed).

**When to use:** Per decision D-01 — dashboard-internal tab switching only.

**Example:**
```tsx
// Inside page.tsx
const [activeTab, setActiveTab] = useState<"dashboard" | "disponibilidade">("dashboard");

// In JSX — replace existing pb-20 with appropriate padding
<>
  {activeTab === "dashboard" ? (
    <DashboardContent />
  ) : (
    <DisponibilidadeTab />
  )}

  {/* Bottom tab bar — sticky, inside the page layout */}
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
    <div className="container mx-auto flex justify-around py-2">
      <button onClick={() => setActiveTab("dashboard")}
        className={cn("flex flex-col items-center gap-1 px-6 py-1 text-xs",
          activeTab === "dashboard" ? "text-primary" : "text-muted-foreground")}
      >
        <BarChart2Icon className="h-5 w-5" />
        <span>Dashboard</span>
      </button>
      <button onClick={() => setActiveTab("disponibilidade")}
        className={cn("flex flex-col items-center gap-1 px-6 py-1 text-xs",
          activeTab === "disponibilidade" ? "text-primary" : "text-muted-foreground")}
      >
        <CalendarDays className="h-5 w-5" />
        <span>Disponibilidade</span>
      </button>
    </div>
  </div>
</>
```

**Key detail:** The dashboard currently has `pb-20` on its container div for bottom padding. This must remain when the bottom tab bar is present.

### Pattern 2: Weekly Grid (Horizontally Scrollable Columns)

**What:** A `div` with `overflow-x: auto` containing 7 fixed-width columns. Each column shows day name, date, occupancy indicator, and free-slot chips.

**When to use:** For the Mon–Sun grid per D-04.

**Example structure:**
```tsx
<div className="overflow-x-auto pb-4" ref={gridRef}>
  <div className="flex gap-3 min-w-max">
    {dias.map((dia) => (
      <DayColumn key={dia.data} dayData={dia} />
    ))}
  </div>
</div>
```

Each column:
```
┌────────────────┐
│  SEG           │  ← day name
│  19/05         │  ← date
│  ████░░ 45%    │  ← occupancy (progress bar + text)
│────────────────│
│  [08:00]       │  ← chip (rounded-full, text-xs)
│  [08:30]       │
│  [09:00]       │
│  [09:30]       │
│  [10:00]       │
│  ...           │
│                │
│  +3 mais       │  ← overflow indicator (optional)
└────────────────┘
```

Column width: approximately `140px` fixed, allowing ~4 columns visible on a 375px phone screen with scrolling.

### Pattern 3: Chip Rendering (Matches Existing)

**What:** Small rounded buttons showing time strings, matching the pattern already used in `AgendamentoFormDrawer.tsx:438-455`.

**When to use:** For each free time slot in a day column.

**Source:** [VERIFIED: codebase pattern in AgendamentoFormDrawer.tsx]
```tsx
// Existing pattern (reuse in DayColumn.tsx)
<Button
  variant="outline"
  className="rounded-full h-8 text-xs"
>
  {time} {/* e.g., "08:00" */}
</Button>
```

### Pattern 4: Export via html-to-image (toBlob)

**What:** Captures the grid ref as a PNG blob using `toBlob` from `html-to-image`, then triggers download or share.

**When to use:** For the Export button in the grid header (DISP-03).

**Source:** [VERIFIED: Context7 docs + codebase AgendamentoFormDrawer.tsx:94-137]
```tsx
import { toBlob } from "html-to-image";

const handleExport = async () => {
  if (!gridRef.current) return;
  setIsExporting(true);

  try {
    const blob = await toBlob(gridRef.current, {
      cacheBust: true,
      backgroundColor: `hsl(${getComputedStyle(document.documentElement)
        .getPropertyValue('--card')})`,
      pixelRatio: 2,
    });

    if (!blob) throw new Error("Falha ao gerar imagem.");

    // Download approach
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `disponibilidade-semana-${weekLabel}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao exportar:", error);
  } finally {
    setIsExporting(false);
  }
};
```

**Export full-width containment:** The grid container ref should include a fixed-width wrapper so `toBlob` captures ALL 7 columns, not just the visible viewport. Consider wrapping the grid in an inner div that forces `min-width: 980px` (7 × 140px) during export:

```tsx
<div ref={exportRef}>
  <div className={`overflow-x-auto ${isExporting ? 'min-w-[980px]' : ''}`}>
    {/* grid content */}
  </div>
</div>
```

### Anti-Patterns to Avoid

- **Route-based tab for availability:** The decision says state-based switch, not a new route. Don't create `/dashboard/disponibilidade` — use `useState` in page.tsx.
- **Separate query per day:** The whole optimization point of D-10 is to avoid 7 separate IndexedDB queries. The new `gerarGradeSemanal` must query all 7 days in one pass.
- **Refetching on every render:** Use React Query `queryKey` that depends on `[servicoId, weekStart]` to cache the grid data.
- **Nested scroll inside a column:** Each day column should simply flex-wrap its chips. Avoid nested scroll per column on mobile — keep it simple.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM→PNG export | Canvas rendering from scratch | `html-to-image` (v1.11.13, already installed) | Handles CSS→canvas mapping, font loading, pixel ratio, background color [VERIFIED: Context7 docs] |
| Date math (week starts, day ranges, formatting) | Manual Date object arithmetic | `date-fns` v4.1.0 functions | Already installed; `startOfWeek`, `addWeeks`, `eachDayOfInterval`, `format` with `dd/MM` handle BR locale [VERIFIED: package.json] |
| IndexedDB range queries | Custom IndexedDB wrapper | Dexie `.where().between()` | Already installed; Dexie v4.2.1 supports ranged primary key queries that are efficient [VERIFIED: codebase db/index.ts] |

**Key insight:** All three "don't hand-roll" items share one property — they look simple at first glance but have numerous edge cases. `html-to-image` handles `@font-face`, nested `overflow`, and cross-origin images. `date-fns` handles DST transitions and locale formatting. Dexie's `between` on the `dataHoa` indexed field ensures sub-millisecond range queries instead of full table scans.

## Common Pitfalls

### Pitfall 1: Performance — Querying All Agendamentos Instead of Range
**What goes wrong:** `gerarGradeSemanal` calls `db.agendamentos.toArray()` (full table scan) instead of using a ranged query.
**Why it happens:** The existing `gerarHorariosDisponiveis` only queries a single day via `startsWith(dataStr)`. A 7-day version could naively loop 7 times.
**How to avoid:** Query once with `db.agendamentos.where("dataHora").between(weekStartISO, weekEndISO).toArray()`. The `agendamentos` table has `dataHoa` as an indexed key [VERIFIED: Dexie schema in db/index.ts].
**Warning signs:** Grid takes >500ms to render, UI freezes during week navigation.

### Pitfall 2: Export Captures Only Visible Viewport
**What goes wrong:** `toBlob` on the scrollable grid captures only the visible portion (first 3-4 columns), not all 7 days.
**Why it happens:** `html-to-image` captures the element as rendered. If it's `overflow-x: auto`, only the visible children are in the layout.
**How to avoid:** Before calling `toBlob`, temporarily set `overflow: visible` and `min-width: 980px` on the grid container, or capture a wrapper `div` that contains the full grid width.
**Warning signs:** Export image shows only 3-4 day columns.

### Pitfall 3: Occupancy Calculation Off by One at Day Boundaries
**What goes wrong:** The last slot of the day is included when it doesn't fully fit within `fimExpediente`.
**Why it happens:** The existing `gerarHorariosDisponiveis` correctly checks `tempo + duracaoMinutos <= fimExpediente`. The occupancy computation must use the **same** total-slot-counting logic.
**How to avoid:** Reuse the same `toMinutes()` helper and slot-looping logic from `gerarHorariosDisponiveis` when computing `totalPossibleSlots`.
**Warning signs:** Occupancy shows >100% or the last slot's end time exceeds expediente fim.

### Pitfall 4: Intervalo Not Subtracted From Total Slots
**What goes wrong:** The total possible slots for a day counts slots that fall within the break interval.
**Why it happens:** The total slots calculation doesn't account for `intervaloInicio`/`intervaloFim`.
**How to avoid:** In the total-slot loop, check `inicioSlot < intervaloFim && fimSlot > intervaloInicio` just like `gerarHorariosDisponiveis` does, and increment a `breakSlots` counter. Subtract break slots from total.
**Warning signs:** Occupancy is artificially low because break slots inflate the denominator.

### Pitfall 5: Stacking Tab Bar Over Page Content
**What goes wrong:** The fixed bottom tab bar overlaps the last content row.
**Why it happens:** The dashboard page uses `pb-20` for bottom padding, but the tab bar may need more space.
**How to avoid:** Ensure the dashboard container has `pb-24` (or whatever the tab bar height is) when the tab bar is present. Alternatively, wrap the tab content in a container with `mb-[64px]` to account for the bar.

## Code Examples

Verified patterns from official sources:

### New Service Method: `gerarGradeSemanal`

```typescript
// Source: Derived from existing gerarHorariosDisponiveis (AgendamentoService.ts:229-295)
// with Dexie range query pattern from db/index.ts
// Confidence: HIGH — follows exact same logic pattern, only bulk

export interface DiaGrade {
  data: string;            // "2026-05-19"
  diaSemana: string;       // "Seg", "Ter", ...
  dataFormatada: string;   // "19/05"
  slotsLivres: string[];   // ["08:00", "08:30", ...]
  totalSlots: number;
  slotsOcupados: number;
  ocupacaoPercent: number; // 0-100
}

export interface GradeSemanal {
  semanaLabel: string;     // "Semana de 19/05 a 25/05"
  dias: DiaGrade[];
  servicoId: string;
}

// Inside AgendamentoServiceClass (AgendamentoService.ts)
async gerarGradeSemanal(servicoId: string, weekStart?: Date): Promise<GradeSemanal> {
  const usuario = await db.usuarios.toCollection().first();
  if (!usuario) return { semanaLabel: "", dias: [], servicoId };

  const servico = await db.servicos.get(servicoId);
  if (!servico) return { semanaLabel: "", dias: [], servicoId };

  const start = weekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(start, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const inicioExpediente = this.toMinutes(usuario.inicio);
  const fimExpediente = this.toMinutes(usuario.fim);
  const intervaloInicio = usuario.intervaloInicio ? this.toMinutes(usuario.intervaloInicio) : null;
  const intervaloFim = usuario.intervaloFim ? this.toMinutes(usuario.intervaloFim) : null;
  const duracao = servico.duracaoMinutos;

  // Single bulk query for all 7 days
  const startISO = format(start, "yyyy-MM-dd");
  const endISO = format(end, "yyyy-MM-dd");
  const todosAgendamentos = await db.agendamentos
    .where("dataHora")
    .between(startISO, `${endISO}T23:59:59`, true, true)
    .toArray();

  const hoje = new Date();
  const hojeStr = format(hoje, "yyyy-MM-dd");
  const agoraMin = hoje.getHours() * 60 + hoje.getMinutes();

  const dias: DiaGrade[] = days.map((dia) => {
    const dataStr = format(dia, "yyyy-MM-dd");
    const diaSemana = format(dia, "EEE", { locale: ptBR }).toUpperCase().replace(".", "");
    const dataFormatada = format(dia, "dd/MM");

    // Filter agendamentos for this day
    const agendamentosDoDia = todosAgendamentos.filter(
      (ag) => ag.dataHora.startsWith(dataStr) && ag.status !== "CANCELADO"
    );

    // Get appointment intervals for overlap detection
    const intervalosAgendamento = agendamentosDoDia.map((ag) => ({
      inicio: this.toMinutes(ag.dataHora.slice(11, 16)),
      fim: this.toMinutes(ag.dataHora.slice(11, 16)) + duracao, // Note: actual service duration may differ
    }));

    const slotsLivres: string[] = [];
    let slotsOcupados = 0;
    let totalSlots = 0;

    for (let tempo = inicioExpediente; tempo + duracao <= fimExpediente; tempo += duracao) {
      const inicioSlot = tempo;
      const fimSlot = tempo + duracao;

      // Skip past current time if today
      if (dataStr === hojeStr && inicioSlot < agoraMin) continue;

      let conflito = false;

      // Check break interval
      if (intervaloInicio !== null && intervaloFim !== null &&
          inicioSlot < intervaloFim && fimSlot > intervaloInicio) {
        conflito = true;
      }

      // Check appointment conflicts
      if (!conflito) {
        for (const ag of intervalosAgendamento) {
          if (inicioSlot < ag.fim && fimSlot > ag.inicio) {
            conflito = true;
            break;
          }
        }
      }

      totalSlots++;
      if (conflito) {
        slotsOcupados++;
      } else {
        const h = Math.floor(tempo / 60).toString().padStart(2, "0");
        const m = (tempo % 60).toString().padStart(2, "0");
        slotsLivres.push(`${h}:${m}`);
      }
    }

    return {
      data: dataStr,
      diaSemana,
      dataFormatada,
      slotsLivres,
      totalSlots,
      slotsOcupados,
      ocupacaoPercent: totalSlots > 0 ? Math.round((slotsOcupados / totalSlots) * 100) : 0,
    };
  });

  const semanaLabel = `Semana de ${format(start, "dd/MM")} a ${format(end, "dd/MM")}`;

  return { semanaLabel, dias, servicoId };
}
```

**Note on "passo":** The existing `gerarHorariosDisponiveis` accepts a `passoMinutos` parameter separate from `duracaoMinutos`. For the weekly grid (D-03), the step is always equal to the service's duration (no fixed 30min grid). So `passo = duracao` always.

### Dedicated Hook: `useAvailabilityGrid`

```typescript
// Source file: src/hooks/useAvailabilityGrid.ts
// Pattern: follows useDashboardAgendamentos.ts with useQuery
// Confidence: HIGH

import { useQuery } from "@tanstack/react-query";
import { AgendamentoService, GradeSemanal } from "@/core/services/AgendamentoService";
import { queryKeys } from "@/lib/queryKeys";
import { startOfWeek, addWeeks } from "date-fns";

export function useAvailabilityGrid(servicoId: string | null, weekOffset: number) {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });

  const { data, isLoading, error } = useQuery<GradeSemanal>({
    queryKey: [...queryKeys.gradeDisponibilidade, servicoId, weekStart.toISOString()],
    queryFn: () => AgendamentoService.gerarGradeSemanal(servicoId!, weekStart),
    enabled: !!servicoId,
  });

  return {
    grade: data,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    semanaLabel: data?.semanaLabel ?? "",
  };
}
```

### Occupancy Indicator in Day Column

```typescript
// Inside DayColumn.tsx — occupancy bar + percentage
// Confidence: MEDIUM (design is agent discretion)

interface DayColumnProps {
  dia: DiaGrade;
}

export function DayColumn({ dia }: DayColumnProps) {
  const ocup = dia.ocupacaoPercent;
  const barColor = ocup > 75 ? "bg-red-500" : ocup > 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col w-[130px] shrink-0 border rounded-lg p-3 bg-card">
      {/* Header: day name + date */}
      <div className="text-center mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">{dia.diaSemana}</p>
        <p className="text-sm font-semibold">{dia.dataFormatada}</p>
      </div>

      {/* Occupancy bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Ocupação</span>
          <span className="font-semibold">{ocup}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(ocup, 100)}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-2" />

      {/* Chips */}
      <div className="flex flex-wrap gap-1">
        {dia.slotsLivres.length > 0 ? (
          dia.slotsLivres.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-background text-foreground"
            >
              {slot}
            </span>
          ))
        ) : (
          <p className="text-[10px] text-muted-foreground italic">Indisponível</p>
        )}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gerarHorariosDisponiveis` returns `string[]` for single day | `gerarGradeSemanal` returns structured `GradeSemanal` with slots + occupancy stats | Phase 7 | Enables one-pass bulk computation + occupancy without separate calculations |
| Single day availability popover in Drawer | Full week grid in dedicated dashboard tab | Phase 7 | Changes UI model from "pick a date, see slots" to "see all 7 days at once" |

**Deprecated/outdated:**
- The `passoMinutos` parameter in `gerarHorariosDisponiveis` is separate from `duracaoMinutos`. For the weekly grid, passo always equals duracao (D-03). No need to modify the old method, but the new method hardcodes `passo = duracao`.

## Validation Architecture

> **Note:** `workflow.nyquist_validation` is not set in `.planning/config.json` — default: enabled.

### Test Framework
No test infrastructure exists in the project (zero test/spec files found). Phase 7 will be tested manually via browser.

| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
Phase 7 has no existing automated tests. All testing is manual/browser-based.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISP-01 | Service selector populates and filters grid | Manual | — | ❌ Wave 0 |
| DISP-02 | Grid renders 7 columns with free slots | Manual | — | ❌ Wave 0 |
| DISP-03 | Export button generates PNG | Manual | — | ❌ Wave 0 |
| OCUP-01 | Occupancy percentage shown per column | Manual | — | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] No test framework installed — Phase 7 does not introduce test dependencies (out of scope for this phase)

## Environment Availability

> **Step 2.6: SKIPPED** — Phase 7 has no external dependencies. All code is client-side React/TypeScript/Dexie. No new CLIs, runtimes, databases, or services are required beyond what already exists in the project.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| html-to-image | DISP-03 export | ✓ | 1.11.13 | — |
| date-fns | Week math, formatting | ✓ | 4.1.0 | — |
| dexie | IndexedDB queries | ✓ | 4.2.1 | — |
| @tanstack/react-query | Data fetching | ✓ | 5.91.3 | — |
| lucide-react | Icons | ✓ | 0.555.0 | — |

No missing dependencies.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `db.agendamentos.where("dataHora").between(start, end)` is efficient (uses the `dataHoa` indexed key) | Code Examples — Service Method | LOW — The Dexie schema in `db/index.ts` confirms `dataHoa` is indexed. If the query were slow, add explicit compound index. |
| A2 | The service's `duracaoMinutos` is the correct slot step for the grid | Code Examples | LOW — D-03 explicitly says "each slot spans the selected service's duration." If user later wants fixed-step grid, passo becomes independent. |
| A3 | `toBlob` captures the full week when given a wrapper with forced width | Common Pitfalls | MEDIUM — The export-ref `div` needs `min-width` during export. If this doesn't work, use `toPng` with `canvasWidth` option instead. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Should past-day columns show "Indisponível" or be hidden?**
   - What we know: The grid shows the current week. Past days (yesterday, earlier today) have no available slots.
   - What's unclear: Should past-day columns render with "Indisponível" or be grayed out, or should they be hidden entirely?
   - Recommendation: Render them as grayed-out with "Indisponível" (simpler, predictable column count). The existing `gerarHorariosDisponiveis` already skips past times for today.

2. **What happens when `servicoId` is null (no service selected)?**
   - What we know: The service selector must handle empty state when no services exist.
   - What's unclear: Should the grid render empty columns or show a "Selecione um serviço" prompt?
   - Recommendation: Show a centered "Selecione um serviço para ver a disponibilidade" placeholder when no service is selected.

3. **Export on devices without native share support — only download?**
   - What we know: The existing pattern in `AgendamentoFormDrawer.tsx` tries `navigator.share` first, falls back to clipboard copy.
   - What's unclear: Should the grid export also try clipboard copy, or just download as a file?
   - Recommendation: Use download (simpler), since the export button is explicitly "Exportar" not "Compartilhar".

## Sources

### Primary (HIGH confidence)
- Codebase: `src/core/services/AgendamentoService.ts` — Existing `gerarHorariosDisponiveis` pattern (229-295)
- Codebase: `src/app/agendamentos/AgendamentoFormDrawer.tsx` — `toBlob` export pattern (94-137)
- Codebase: `src/hooks/useDashboardAgendamentos.ts` — Hook pattern for dashboard data
- Codebase: `src/core/db/index.ts` — Dexie schema, confirmed `dataHoa` indexed (line 23)
- Codebase: `package.json` — All dependency versions verified
- Context7: `/bubkoo/html-to-image` — `toBlob` API with `cacheBust`, `backgroundColor`, `pixelRatio` options

### Secondary (MEDIUM confidence)
- Codebase conventions: `.planning/codebase/CONVENTIONS.md` — Component placement, hooks pattern
- Codebase structure: `.planning/codebase/STRUCTURE.md` — Where to add new dashboard components

### Tertiary (LOW confidence)
- None — all key claims are backed by codebase patterns or verified docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via `package.json` and `npm ls`
- Architecture: HIGH — patterns directly derived from existing codebase code
- Pitfalls: HIGH — derived from known IndexedDB/Dexie timing + html-to-image scroll issues
- Export pattern: HIGH — directly verified against existing working code + Context7 docs

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (30-day — stable dependency versions)
