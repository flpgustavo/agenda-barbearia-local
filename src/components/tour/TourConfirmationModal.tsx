"use client";

/**
 * TourConfirmationModal.tsx
 *
 * Modal de confirmação "Quer fazer um tour rápido?" que aparece
 * na primeira visita do usuário (quando `tour_first_visit` não
 * existe no localStorage).
 *
 * Decisões aplicadas:
 *   D-08: Gatilho duplo — automático na primeira visita
 *   D-09: "Agora não" cria flag tour_first_visit no localStorage
 *   D-10: Se "Agora não", modal não reaparece
 *   D-17: Sem flag = primeira visita
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TourConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDismiss: () => void;
}

export function TourConfirmationModal({
  open,
  onOpenChange,
  onAccept,
  onDismiss,
}: TourConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] max-w-lg rounded-2xl md:w-full">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            Quer fazer um tour rápido?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            Vamos te mostrar como usar o app na prática — em apenas 5 passos
            você aprende a criar clientes, agendar serviços e registrar
            transações.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            onClick={onDismiss}
          >
            Agora não
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto"
            onClick={onAccept}
          >
            Sim, quero aprender
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
