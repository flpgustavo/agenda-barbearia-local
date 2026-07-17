# Phase 7: Disponibilidade & Ocupação — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Display a weekly availability grid (free time slots per service) and occupancy rates per day.

Requirements covered: DISP-01, DISP-02, DISP-03, OCUP-01

</domain>

<decisions>
## Implementation Decisions

### Navigation & Section Placement
- **D-01:** Availability lives on a **separate dashboard tab** via a **bottom nav switcher** within the dashboard page only (not app-wide). Tabs: "Dashboard" (current scrollable view) | "Disponibilidade" (availability grid). No route change — state-based tab switch.

### Availability Grid Layout
- **D-02:** Week starts on **Monday** — Mon-Sun grid (BR standard).
- **D-03:** Each slot spans the **selected service's duration** (not fixed 30min). Uses the service's `duracaoMinutos`.
- **D-04:** **One column per day, horizontally scrollable** — classic calendar week view. Days as columns, time slots as rows within each column.
- **D-05:** Grid shows each day with available times rendered as **chips** (matching the existing chip pattern in `AgendamentoFormDrawer.tsx`).
- **D-06:** Grid displays the **current week** with **navigation arrows** to go forward/backward weeks.
- **D-07:** Grid **auto-refreshes** immediately when user selects a different service.
- **D-08:** A week header shows the date range (e.g., "Semana de 19/05 a 25/05").

### Occupancy (OCUP-01)
- **D-09:** Occupancy percentage is shown **in-grid as a column indicator** per day (not a separate card). Each day column shows the % of occupied slots in its header/indicator area.

### Data Layer
- **D-10:** A **new service method** `gerarGradeSemanal(servicoId)` on `AgendamentoService` that bulk-computes 7 days of availability in one pass, avoiding 7 individual IndexedDB reads. It will return structured data: per-day free slots + occupancy stats.
- **D-11:** Service selector is a **horizontal scrollable row of service cards/buttons** above the grid. User taps one to select.

### Export (DISP-03)
- **D-12:** Export button (`html-to-image`) placed in the **grid header bar**, patterned after the existing share button in `AgendamentoFormDrawer.tsx`. Exports the visible grid as a PNG image.

### Agent's Discretion
- Visual design of the bottom tab bar (icons, labels, active state highlight)
- Visual design of each day column within the grid (chip colors, spacing)
- Loading skeleton pattern for the grid
- Empty state when no services exist
- Responsive breakpoints for grid columns
- Exact chip size and layout per day column
- How the occupancy indicator looks (progress bar, percentage text, or both)
- Implementation approach for the new service method (local Dexie queries)

### Folded Todos
None — no pending todos matched Phase 7.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — DISP-01, DISP-02, DISP-03, OCUP-01 definitions

### Codebase
- `src/core/services/AgendamentoService.ts` — Existing `gerarHorariosDisponiveis(dataStr, duracao, passo)` returns free times for a single day. New `gerarGradeSemanal(servicoId)` method to be added.
- `src/core/models/Servico.ts` — `Servico` has `duracaoMinutos` (used for slot sizing).
- `src/core/models/Usuario.ts` — `inicio`, `fim`, `intervaloInicio`, `intervaloFim` define the work schedule.
- `src/app/dashboard/page.tsx` — Current dashboard page where a bottom tab bar will be added.
- `src/app/agendamentos/AgendamentoFormDrawer.tsx:94` — Existing `html-to-image` export pattern using `toBlob`.
- `src/hooks/useDashboardAgendamentos.ts` — Existing hook; Phase 7 availability data may be consumed via a new dedicated hook or extended here (agent discretion).

### Patterns
- `.planning/codebase/CONVENTIONS.md` — Coding conventions, component patterns
- `.planning/codebase/STRUCTURE.md` — Where to add dashboard components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `html-to-image` (v1.11.13) already installed and used in `AgendamentoFormDrawer.tsx`
- `src/components/ui/button.tsx` — For service selector cards and export button
- `src/components/ui/card.tsx` — For grid card container
- `src/components/ui/skeleton.tsx` — Loading state pattern
- `src/components/ui/separator.tsx` — Dividers
- `src/core/services/AgendamentoService.ts` — Contains `gerarHorariosDisponiveis(dataStr, duracao, passo)` as reference for new bulk method
- Dexie queries on `db.agendamentos`, `db.servicos`, `db.usuarios`

### Established Patterns
- **Client components**: `"use client"` directive at top
- **Component placement**: Co-located in `src/app/dashboard/` (not in shared components)
- **Hook integration**: Props passed from hook to component, reactive on filter/service change
- **Loading state**: Skeleton placeholders matching component dimensions

### Integration Points
- `src/app/dashboard/page.tsx` — Needs bottom tab bar + conditional rendering of either Dashboard content or Disponibilidade content
- `AgendamentoService` — Needs new `gerarGradeSemanal(servicoId)` method
- Potentially a new hook `useAvailabilityGrid(servicoId)` or extended `useDashboardAgendamentos`

### Data Shape
- `Usuario` provides: `inicio`, `fim` (expediente), `intervaloInicio`, `intervaloFim`
- `Servico` provides: `duracaoMinutos` (slot size)
- `Agendamento.dataHora` + `status` + `servicoId` determine occupied slots per day
- Occupancy = (occupied slots / total possible slots in expediente) per day

</code_context>

<specifics>
## Specific Ideas

- Bottom tab bar should be minimal — two tabs with icons (Dashboard / Calendar or Clock icon)
- Service cards row: horizontal scroll, each card shows service name, selected card is highlighted
- Grid columns: each day column shows day name (Seg, Ter...) + date (DD/MM) + occupancy % + chip list of free times
- Chips follow existing pattern: small rounded buttons showing "HH:MM" format
- Week navigation: < arrows > in the grid header, current week label in between
- Export button: positioned in grid header next to week navigation, uses `html-to-image` `toBlob` + native share or download

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-disponibilidade-ocupacao*
*Context gathered: 2026-05-21*
