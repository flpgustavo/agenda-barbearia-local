/**
 * useAutoAdvance.ts
 *
 * Hook utilizado pelos formulários (drawers) de criação de entidades
 * para notificar o sistema de tour que uma entidade foi criada com
 * sucesso e o tour pode avançar para o próximo passo.
 *
 * Uso:
 * ```tsx
 * function ClienteFormDrawer() {
 *   const { notifyStepComplete } = useAutoAdvance(0);
 *
 *   async function handleSubmit(data: ClienteFormData) {
 *     await salvarCliente(data);
 *     notifyStepComplete(); // → onEntityCreated(0)
 *   }
 * }
 * ```
 *
 * O passo é marcado como concluído imediatamente via COMPLETE_STEP.
 * O avanço para o próximo passo ocorre após 500ms (delay definido
 * dentro do TourProvider.onEntityCreated), tempo suficiente para o
 * drawer de formulário fechar antes da navegação automática.
 */

import { useTour } from "@/hooks/useTour";

export function useAutoAdvance(stepIndex: number) {
  const { onEntityCreated } = useTour();

  function notifyStepComplete() {
    onEntityCreated(stepIndex);
  }

  return { notifyStepComplete };
}
