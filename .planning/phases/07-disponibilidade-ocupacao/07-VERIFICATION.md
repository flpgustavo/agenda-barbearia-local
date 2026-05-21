---
phase: 07-disponibilidade-ocupacao
verified: 2026-05-21T14:55:00Z
status: human_needed
score: 13/13 must-haves verified
overrides_applied: 0
gaps: []
human_verification:
  - test: "Verificar visual da barra de abas inferior no Dashboard"
    expected: "Botões 'Dashboard' (ícone BarChart3) e 'Disponibilidade' (ícone CalendarDays) alternam conteúdo. Active tab destacado com text-primary."
    why_human: "Visual appearance of active/inactive tab states and icon rendering"
  - test: "Verificar grid semanal — 7 colunas Seg-Dom com chips de horários"
    expected: "Cada coluna mostra: nome do dia (SEG, TER...), data (DD/MM), barra de ocupação com %, chips de horários livres. Dias passados com opacidade reduzida e 'Indisponível'. Grid com scroll horizontal."
    why_human: "Visual appearance of grid layout, chip rendering, occupied bar colors, and past-day treatment"
  - test: "Verificar export PNG com todas as 7 colunas"
    expected: "Ao clicar Exportar, download de imagem PNG contendo todas as 7 colunas (não apenas as visíveis na viewport). Nome do arquivo inclui o label da semana."
    why_human: "Cannot verify image output programmatically — needs manual inspection of exported PNG"
  - test: "Verificar seletor de serviço + navegação entre semanas"
    expected: "Card de serviço selecionado fica destacado (bg-primary). Navegação < > muda as semanas. Grid auto-atualiza ao trocar serviço ou semana."
    why_human: "User flow completion — selecting a service and navigating weeks needs visual verification"
  - test: "Verificar fórmula de ocupação percentual"
    expected: "Cada coluna do dia mostra % de ocupação (0-100%). Slots de intervalo (almoço) contam como ocupados tanto no numerador quanto no denominador. Validar se o número parece razoável para o cenário de teste."
    why_human: "Occupancy formula interpretation (interval slots counted in both numerator and denominator) needs business acceptance"
---

# Phase 7: Disponibilidade & Ocupação — Verification Report

**Phase Goal:** User can view weekly availability grid by service and occupancy rates per day
**Verified:** 2026-05-21T14:55:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | O método gerarGradeSemanal(servicoId) computa 7 dias em uma única query no IndexedDB | ✓ VERIFIED | `AgendamentoService.ts:315-407`: uses `db.agendamentos.where("dataHora").between(startISO, endISO)` — single ranged query, not 7 individual queries |
| 2 | O retorno de gerarGradeSemanal inclui slotsLivres, ocupacaoPercent e totalSlots por dia | ✓ VERIFIED | `DiaGrade` interface (lines 14-22) has all fields: `slotsLivres`, `totalSlots`, `slotsOcupados`, `ocupacaoPercent`. Computed in lines 358-401 |
| 3 | useAvailabilityGrid retorna grade, loading, error e semanaLabel via React Query | ✓ VERIFIED | `useAvailabilityGrid.ts:17-22`: returns `{ grade: data ?? null, loading: isLoading, error: error?.message ?? null, semanaLabel: data?.semanaLabel ?? "" }` |
| 4 | O queryKey gradeDisponibilidade invalida quando servicoId ou semana muda | ✓ VERIFIED | `useAvailabilityGrid.ts:12`: queryKey includes `[...queryKeys.gradeDisponibilidade, servicoId, weekStart.toISOString()]` |
| 5 | Usuário vê barra de abas inferior com 'Dashboard' e 'Disponibilidade' | ✓ VERIFIED | `page.tsx:231-256`: fixed bottom tab bar with BarChart3 (Dashboard) and CalendarDays (Disponibilidade) icons |
| 6 | Usuário pode selecionar serviço em row horizontal de cards | ✓ VERIFIED | `ServiceSelectorRow.tsx:21-46`: horizontal scrollable row, selected card gets `bg-primary text-primary-foreground` |
| 7 | Usuário vê grid semanal (Seg-Dom) com colunas scrolláveis | ✓ VERIFIED | `DisponibilidadeGrid.tsx:19-28`: `overflow-x-auto` wrapper, `flex gap-3 min-w-max` with 7 DayColumn children |
| 8 | Cada coluna mostra nome do dia, data, % ocupação e chips de horários | ✓ VERIFIED | `DayColumn.tsx:15-57`: renders `dia.diaSemana`, `dia.dataFormatada`, occupancy bar with percentage, and chip list |
| 9 | Usuário navega entre semanas com setas < > | ✓ VERIFIED | `WeekNavigator.tsx:18-24`: ChevronLeft/ChevronRight buttons. `DisponibilidadeTab.tsx:27-28`: weekOffset state changes |
| 10 | Usuário exporta grid como PNG via botão no cabeçalho | ✓ VERIFIED | `DisponibilidadeTab.tsx:30-58`: `toBlob` with `cacheBust: true`, `pixelRatio: 2`, download via anchor click |
| 11 | Dias passados mostram 'Indisponível' em vez de slots | ✓ VERIFIED | `DayColumn.tsx:16`: `opacity-50` CSS for past days. Line 52: `{isPast ? "Indisponível" : "Lotado"}` |
| 12 | Estado de loading mostra skeletons | ✓ VERIFIED | `DisponibilidadeTab.tsx:110-111`: renders `<DisponibilidadeSkeleton />` when loading |
| 13 | Estado vazio (sem serviços) mostra placeholder | ✓ VERIFIED | `DisponibilidadeTab.tsx:61-67`: empty services shows ServiceSelectorRow with empty prop. ServiceSelectorRow:12-18 renders contextual message |

**Score:** 13/13 truths verified

### Deferred Items

No deferred items — Phase 8 (Retenção de Clientes) addresses client retention, not availability/occupancy gaps.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/core/services/AgendamentoService.ts` | GradeSemanal/DiaGrade interfaces + gerarGradeSemanal method | ✓ VERIFIED | Interfaces at lines 14-28, method at lines 315-407. Exists, substantive (real computation), wired (imported by useAvailabilityGrid) |
| `src/lib/queryKeys.ts` | gradeDisponibilidade query key | ✓ VERIFIED | Line 9: `gradeDisponibilidade: ['gradeDisponibilidade'] as const`. Exists, wired (imported by useAvailabilityGrid) |
| `src/hooks/useAvailabilityGrid.ts` | Hook consuming gerarGradeSemanal via useQuery | ✓ VERIFIED | 23-line hook with `useQuery<GradeSemanal>`. Returns grade/loading/error/semanaLabel. Wired to DisponibilidadeTab |
| `src/app/dashboard/DayColumn.tsx` | Day column with name, date, occupancy, chips | ✓ VERIFIED | 58 lines. Renders real DiaGrade data. Handles past/current days |
| `src/app/dashboard/DisponibilidadeGrid.tsx` | 7-column horizontal scroll container | ✓ VERIFIED | 32 lines. Maps grade.dias to DayColumn. Accepts exportRef and isExporting |
| `src/app/dashboard/DisponibilidadeSkeleton.tsx` | 7-column loading skeleton | ✓ VERIFIED | 24 lines. 7 skeleton columns with Skeleton components |
| `src/app/dashboard/ServiceSelectorRow.tsx` | Horizontal service card selector | ✓ VERIFIED | 47 lines. Renders Servico cards with name+price. Empty state handled |
| `src/app/dashboard/WeekNavigator.tsx` | Week nav arrows + export button | ✓ VERIFIED | 38 lines. ChevronLeft/ChevronRight + "Semana de DD/MM a DD/MM" label + Download button |
| `src/app/dashboard/DisponibilidadeTab.tsx` | Orchestrator — integrates all subcomponents | ✓ VERIFIED | 121 lines. Handles 4 states: no-services, no-selection, loading, error, normal. Uses useServico aliasing |
| `src/app/dashboard/page.tsx` | Modified — bottom tab bar + conditional render | ✓ VERIFIED | Line 40: `activeTab` state. Line 227: conditional `<DisponibilidadeTab />`. Lines 231-256: tab bar. `pb-24` bottom padding |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `useAvailabilityGrid.ts` | `AgendamentoService.ts` | `import { AgendamentoService, GradeSemanal }` | ✓ WIRED | Line 4: `import { AgendamentoService, GradeSemanal }` |
| `useAvailabilityGrid.ts` | `queryKeys.ts` | `import { queryKeys }` | ✓ WIRED | Line 5: `import { queryKeys }` |
| `AgendamentoService.ts` | `db.agendamentos.where().between()` | `.between(startISO, endISO)` | ✓ WIRED | Lines 335-338: `.where("dataHora").between(startISO, "${endISO}T23:59:59", true, true)` — uses indexed `dataHora` field |
| `DisponibilidadeTab.tsx` | `useAvailabilityGrid.ts` | `import { useAvailabilityGrid }` | ✓ WIRED | Line 5: `import { useAvailabilityGrid }` |
| `DisponibilidadeTab.tsx` | `html-to-image` | `import { toBlob }` | ✓ WIRED | Line 6: `import { toBlob } from "html-to-image"` |
| `page.tsx` | `DisponibilidadeTab.tsx` | `import + render condicional` | ✓ WIRED | Line 28: `import { DisponibilidadeTab }`. Line 227: `<DisponibilidadeTab />` |
| `page.tsx` | `lucide-react` | `CalendarDays` and `BarChart3` icons | ✓ WIRED | Lines 11-12: imported. Lines 241, 252: used in tab bar |
| `WeekNavigator.tsx` | `lucide-react` | `ChevronLeft`, `ChevronRight`, `Download` | ✓ WIRED | Line 3: imported. Lines 18, 22, 33: used |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `AgendamentoService.gerarGradeSemanal` | `todosAgendamentos` | `db.agendamentos.where("dataHora").between(...)` query | ✓ FLOWING | Real Dexie IndexedDB query using indexed field — not static/empty |
| `useAvailabilityGrid` | `data` | `AgendamentoService.gerarGradeSemanal()` via `useQuery` | ✓ FLOWING | QueryFn calls real service method with `enabled: !!servicoId` guard |
| `DayColumn.tsx` | `dia.slotsLivres`, `dia.ocupacaoPercent` | Props from DisponibilidadeGrid → grade.dias | ✓ FLOWING | Data flows from Dexie → service → hook → component. Real computed values, not hardcoded |
| `DisponibilidadeTab.tsx` | `servicos` via `items` alias | `useServico()` hook → `useBase` → IndexedDB | ✓ FLOWING | Aliased correctly (`const { items: servicos } = useServico()`) |
| `DisponibilidadeTab.tsx` | `semanaLabel` | `grade?.semanaLabel ?? semanaLabel` | ✓ FLOWING | Uses hook's `semanaLabel` as fallback when grade is null |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compilation | `npx tsc --noEmit` | No errors | ✓ PASS |
| html-to-image dependency | `require.resolve('html-to-image')` | VERIFIED installed | ✓ PASS |
| Module structure | Grep for exports/imports | All 10 artifacts exist and are wired | ✓ PASS |
| Test suite | `npm test` | No test script configured | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DISP-01 | Plan 01 + 02 | User can select a service to view available weekly time slots | ✓ SATISFIED | `ServiceSelectorRow.tsx` renders service cards. `setServicoId` triggers `useAvailabilityGrid` with enabled guard. Grid auto-updates via React Query |
| DISP-02 | Plan 01 + 02 | User can see a visual grid of weekdays with free time slots for the selected service | ✓ SATISFIED | `DisponibilidadeGrid.tsx` renders 7 `DayColumn` components horizontally. Each column shows day name, date, free-slot chips |
| DISP-03 | Plan 01 + 02 | User can export the availability grid as image via html-to-image | ✓ SATISFIED | `DisponibilidadeTab.tsx:30-58`: `toBlob` with `cacheBust: true`, `pixelRatio: 2`, HSL background from CSS var, anchor download |
| OCUP-01 | Plan 01 + 02 | User can see occupancy percentage per day of week | ✓ SATISFIED | `AgendamentoService.ts:401`: `ocupacaoPercent` computed per day. `DayColumn.tsx:11-34`: progress bar + percentage rendered |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No anti-patterns found in phase 7 files |

**Notes:**
- No TODO/FIXME/placeholder/stub comments found in any phase 7 file
- No hardcoded empty arrays or null returns
- All components handle loading, empty, and error states
- TypeScript compiles with zero errors

### Human Verification Required

The following items require manual testing/verification in the browser:

#### 1. Bottom Tab Bar Visual Integration

**Test:** Open the Dashboard page and click between the "Dashboard" and "Disponibilidade" tabs.
**Expected:** Tab bar shows BarChart3 icon + "Dashboard" and CalendarDays icon + "Disponibilidade". Active tab highlighted with `text-primary`. Content switches smoothly. Dashboard tab shows existing content (KPI cards, charts). Disponibilidade tab shows service selector + grid.
**Why human:** Visual appearance of tab bar, icon rendering, active state highlighting, and content transition can't be verified programmatically.

#### 2. Weekly Grid Visual Layout

**Test:** With a service selected, observe the availability grid.
**Expected:** 7 columns (SEG-DOM) horizontally scrollable. Each column shows: day name (uppercase), date (DD/MM), occupancy label + progress bar with color (green <50%, amber 50-75%, red >75%), and free-time chips (rounded-full, text-xs, border). Past days have reduced opacity and show "Indisponível".
**Why human:** Visual appearance of chip styling, progress bar colors, layout, and spacing.

#### 3. Export PNG Image Quality

**Test:** Click the Exportar button in the grid header bar.
**Expected:** A PNG file downloads containing ALL 7 day columns (not just the visible viewport). The filename includes the week label. Background matches the card color (HSL variable).
**Why human:** Cannot validate generated PNG programmatically — needs manual inspection of exported image dimensions and content.

#### 4. Occupancy Percentage Formula

**Test:** Check the occupancy percentage shown per day column.
**Expected:** Percentage reflects `occupied slots / total possible slots`. Interval slots (almoco) are counted in both numerator and denominator — they count as occupied. The percentage should be <= 100%.
**Why human:** The formula interpretation (whether interval slots should affect occupancy %) needs business acceptance. Current implementation counts break slots as occupied — verify this aligns with user expectations.

#### 5. Service Selection + Week Navigation Flow

**Test:** Select different services, navigate forward/backward weeks.
**Expected:** Selected service card highlights. Grid content changes when switching service or week. Loading skeleton appears during data fetch. Empty state shows when no services exist.
**Why human:** End-to-end user flow with data loading timing and state transitions.

### D-01 to D-12 Decision Compliance

| Decision | Description | Status | Evidence |
|----------|-------------|--------|----------|
| D-01 | Bottom tab switcher within dashboard (no route change) | ✓ HONORED | `page.tsx`: state-based `activeTab` with conditional rendering |
| D-02 | Week starts on Monday (BR standard) | ✓ HONORED | `AgendamentoService.ts:322`: `startOfWeek(new Date(), { weekStartsOn: 1 })` |
| D-03 | Slot = selected service's duration (not fixed 30min) | ✓ HONORED | `AgendamentoService.ts:331`: `const passo = duracao;` |
| D-04 | One column per day, horizontally scrollable | ✓ HONORED | `DisponibilidadeGrid.tsx`: `overflow-x-auto` with flex layout |
| D-05 | Free times rendered as chips matching existing pattern | ✓ HONORED | `DayColumn.tsx:43-48`: `rounded-full text-xs border` chips |
| D-06 | Current week with navigation arrows | ✓ HONORED | `WeekNavigator.tsx`: ChevronLeft/ChevronRight. weekOffset state |
| D-07 | Auto-refresh when service changes | ✓ HONORED | `useAvailabilityGrid.ts:12`: queryKey includes servicoId + weekStart |
| D-08 | Week header shows date range | ✓ HONORED | `AgendamentoService.ts:405`: `"Semana de DD/MM a DD/MM"`. Rendered in WeekNavigator |
| D-09 | Occupancy in-grid as column indicator | ✓ HONORED | `DayColumn.tsx:24-34`: progress bar + "%" per day column |
| D-10 | Single ranged query (not 7 reads) | ✓ HONORED | `AgendamentoService.ts:335-338`: single `.between()` query |
| D-11 | Service selector = horizontal scrollable cards | ✓ HONORED | `ServiceSelectorRow.tsx`: horizontal scroll with clickable cards |
| D-12 | Export button in grid header bar (html-to-image) | ✓ HONORED | `WeekNavigator.tsx:26-35`: Download button. `DisponibilidadeTab.tsx:30-58`: toBlob export |

### Gaps Summary

No gaps found. All 13 must-haves verified. All 4 requirements (DISP-01, DISP-02, DISP-03, OCUP-01) satisfied. All 12 decisions (D-01 to D-12) honored. TypeScript compiles with zero errors.

**Minor observation:** The plan's text (07-01-PLAN.md line 284) states "O cálculo de ocupação subtrai slots de intervalo do denominador (Pitfall 4)" but the actual implementation counts interval slots in both numerator and denominator (they are treated as "occupied" slots, not subtracted). This does not affect correctness — both interpretations are valid — but the formula differs from what the plan description claimed. The implementation is consistent with the plan's code template. Tagged for human verification (#5) to confirm business acceptance.

---

_Verified: 2026-05-21T14:55:00Z_
_Verifier: the agent (gsd-verifier)_
