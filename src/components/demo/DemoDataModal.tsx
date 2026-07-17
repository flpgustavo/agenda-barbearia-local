"use client";

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
import { getDb } from "@/core/db";

interface DemoDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoDataModal({ open, onOpenChange }: DemoDataModalProps) {
  async function handleClearData() {
    const _db = getDb();
    await _db.transaction(
      "rw",
      [_db.clientes, _db.servicos, _db.agendamentos, _db.transacoes],
      async () => {

        await _db.clientes.clear();
        await _db.servicos.clear();
        await _db.agendamentos.clear();
        await _db.transacoes.clear();
      },
    );
    localStorage.setItem("demo_data_shown", "true");
    localStorage.setItem("agenda_cleared", "true");
    onOpenChange(false);
    window.location.reload();
  }

  function handleKeepData() {
    localStorage.setItem("demo_data_shown", "true");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] max-w-lg rounded-2xl md:w-full">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            Dados de demonstração
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed space-y-2">
            <p>
              Os dados que você está vendo são fictícios e foram carregados
              automaticamente para demonstrar as funcionalidades do sistema.
            </p>
            <p>
              Você pode mantê-los para explorar o aplicativo ou limpá-los
              para começar com seus próprios dados.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            onClick={handleKeepData}
          >
            Manter dados e explorar
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto"
            onClick={handleClearData}
          >
            Limpar dados de demonstração
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
