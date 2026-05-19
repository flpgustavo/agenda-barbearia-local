"use client";

/**
 * useTourFirstVisit.ts
 *
 * Gerencia a flag `tour_first_visit` no localStorage para detectar
 * se é a primeira visita do usuário.
 *
 * Estados possíveis:
 *   - "first_visit"  → flag não existe (nunca visitou)
 *   - "visited"      → flag="true" (já respondeu "Agora não")
 *   - "skipped"      → flag="skipped" (pulou o tutorial ativamente)
 *   - "completed"    → flag="completed" (completou o tutorial)
 *
 * Decisões D-08 a D-18:
 *   D-09: Flag criada quando usuário opta por "Agora não" ou completa o tour
 *   D-10: Se "Agora não", modal não reaparece
 *   D-16: Flag name: tour_first_visit
 *   D-17: Sem flag = primeira visita
 *   D-18: Flag existe = não é primeira visita
 */

const STORAGE_KEY = "tour_first_visit";

export function useTourFirstVisit() {
  function isFirstVisit(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === null;
  }

  function markVisited(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function markSkipped(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "skipped");
  }

  function markCompleted(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "completed");
  }

  function reset(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  function getStatus(): "first_visit" | "visited" | "skipped" | "completed" {
    if (typeof window === "undefined") return "visited";
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === null) return "first_visit";
    if (val === "skipped") return "skipped";
    if (val === "completed") return "completed";
    return "visited";
  }

  return { isFirstVisit, markVisited, markSkipped, markCompleted, reset, getStatus };
}
