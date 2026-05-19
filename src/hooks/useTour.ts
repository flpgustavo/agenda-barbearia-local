import { useContext } from "react";

import { TourContext } from "@/components/tour/TourProvider";
import type { TourContextValue } from "@/components/tour/types";

/**
 * Hook para acessar o estado e ações do tour de boas-vindas.
 *
 * Retorna um objeto com:
 * - Estado: `status`, `currentStepIndex`, `steps`, `isMobile`
 * - Ações: `startTour`, `nextStep`, `prevStep`, `skipTour`, `goToStep`,
 *   `completeStep`, `onEntityCreated`
 *
 * O tour é mobile-only (viewport <= 640px). Em desktop, `startTour` não
 * ativa a exibição do overlay/tooltip.
 *
 * @example
 * ```tsx
 * function MinhaPagina() {
 *   const { isActive, currentStep, startTour } = useTour();
 *
 *   return (
 *     <button onClick={startTour}>
 *       Iniciar tutorial
 *     </button>
 *   );
 * }
 * ```
 *
 * @throws {Error} Se usado fora de um `<TourProvider>`.
 */
export function useTour(): TourContextValue {
  const context = useContext(TourContext);

  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }

  return context;
}
