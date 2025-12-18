"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import useLongPress from "@/hooks/useLongPress";
import { AgendamentoStatus } from "@/core/models/Agendamento";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

// Defina o tipo ou use 'any' se preferir por enquanto
interface AgendamentoCardProps {
  agendamento: any;
  onLongPress: (ag: any) => void;
  onClick: (ag: any) => void;
}

const getStatusColor = (status: AgendamentoStatus) => {
  switch (status) {
    case "CONFIRMADO": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
    case "CONCLUIDO": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20";
    case "CANCELADO": return "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export function AgendamentoCard({ agendamento, onLongPress, onClick }: AgendamentoCardProps) {
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
              <Clock size={14} /> {format(new Date(agendamento.dataHora), "HH:mm")}
            </span>
          </span>
          <span className="font-medium text-foreground">
            {agendamento.cliente?.nome || "Cliente"}
          </span>
          <span className="text-sm opacity-90 font-medium">
            {agendamento.servico?.nome || "Serviço"}
          </span>
        </div>

        {/* Ações / Status */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wide opacity-85 border border-current px-2 py-0.5 rounded-full">
            {agendamento.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}