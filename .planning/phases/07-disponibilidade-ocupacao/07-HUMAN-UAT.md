---
status: partial
phase: 07-disponibilidade-ocupacao
source: [07-VERIFICATION.md]
started: 2026-05-21T18:00:00.000Z
updated: 2026-05-21T18:00:00.000Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Bottom Tab Bar Visual Integration
expected: Open Dashboard, switch tabs between "Dashboard" and "Disponibilidade". Active tab highlights (text-primary), inactive tab shows muted color. Content switches: KPI cards + charts vs service selector + grid. Header subtitle changes ("Visão geral do negócio" vs "Disponibilidade semanal"). DateRangeFilter only shows on Dashboard tab.
result: [pending]

### 2. Weekly Grid Visual Layout
expected: With service selected, 7 columns (SEG-DOM) show day name + date + occupancy bar (green <50%, amber 50-75%, red >75%) + free-time chips (rounded-full, text-xs, border). Past days show reduced opacity and "Indisponível". Days with no slots show "Lotado". Chips follow existing AgendamentoFormDrawer pattern.
result: [pending]

### 3. Export PNG Image Quality
expected: Click Exportar button in WeekNavigator. PNG downloads with filename `disponibilidade-Semana de DD-MM a DD-MM.png`. All 7 columns visible (not just viewport — min-w-[980px] applied). Toast success/error feedback. Pixel ratio 2x for quality.
result: [pending]

### 4. Occupancy Percentage Formula
expected: Verify occupancy % looks reasonable for a barber shop day. Current implementation counts interval (lunch) slots as occupied in both numerator and denominator. Confirm alignment with business expectations.
result: [pending]

### 5. Service Selection + Week Navigation Flow
expected: Select different services from horizontal scrollable card row. Grid auto-updates (loading skeleton appears briefly). Navigate weeks with < > arrows. Week label updates "Semana de DD/MM a DD/MM". Week offset correctly computes Mon-Sun.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
