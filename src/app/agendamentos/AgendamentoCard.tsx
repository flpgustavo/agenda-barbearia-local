"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import useLongPress from "@/hooks/useLongPress";
import { AgendamentoStatus } from "@/core/models/Agendamento";

// Defina o tipo ou use 'any' se preferir por enquanto
interface AgendamentoCardProps {
  agendamento: any;
  onLongPress: (ag: any) => void;
  onClick: (ag: any) => void;
  getStatusColor: (status: AgendamentoStatus) => string;
}

export function AgendamentoCard({ agendamento, onLongPress, onClick, getStatusColor }: AgendamentoCardProps) {
  // O Hook agora vive feliz dentro deste componente
  const longPressProps = useLongPress(
    () => onLongPress(agendamento),
    () => onClick(agendamento),
    { delay: 600 }
  );

  return (
    <Card
      {...longPressProps}
      className={`border ${getStatusColor(agendamento.status)} shadow-sm transition-all hover:shadow-md py-2 cursor-pointer select-none`}
    >
      <CardContent className="p-3 flex justify-between items-center">
        {/* Informações */}
        <div className="flex flex-col">
          <span className="font-bold text-lg">
            <span className="flex flex-row items-center gap-1">
              <Clock size={14} /> {agendamento.dataHora.slice(11, 16)}
            </span>
          </span>
          <span className="font-medium text-foreground">
            {agendamento.cliente.nome || "Cliente"}
          </span>
          <span className="text-sm opacity-90 font-medium">
            {agendamento.servico.nome || "Serviço"}
          </span>
        </div>

        {/* Ações / Status */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wide opacity-70 border border-current px-2 py-0.5 rounded-full">
            {agendamento.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}