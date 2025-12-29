"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CalendarClock, 
  CheckCheck,
  CheckCircle2Icon
} from "lucide-react";
import useLongPress from "@/hooks/useLongPress";
import { AgendamentoStatus } from "@/core/models/Agendamento";
import { format } from "date-fns";
// Importações do Framer Motion para animações
import { motion, useAnimation, PanInfo } from "framer-motion";

interface AgendamentoCardProps {
  agendamento: any;
  onLongPress: (ag: any) => void;
  onClick: (ag: any) => void;
  // Nova prop opcional para lidar com a conclusão via swipe
  onConcluirSwipe?: (ag: any) => void;
}

// Configuração visual baseada no status
const getStatusConfig = (status: AgendamentoStatus) => {
  switch (status) {
    case "CONFIRMADO":
      return {
        colorClass: "text-primary",
        bgClass: "bg-primary/15 text-primary border-primary/20 hover:bg-primary/20",
        icon: <CalendarClock size={24} className="text-primary" />,
      };
    case "CONCLUIDO":
      return {
        colorClass: "text-emerald-500",
        bgClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
        icon: <CheckCircle2Icon size={24} className="text-emerald-500" />,
      };
    default:
      return {
        colorClass: "text-muted-foreground",
        bgClass: "border-muted",
        icon: <AlertCircle size={24} />,
      };
  }
};

export function AgendamentoCard({ 
  agendamento, 
  onLongPress, 
  onClick, 
  onConcluirSwipe 
}: AgendamentoCardProps) {
  const controls = useAnimation();
  const statusConfig = getStatusConfig(agendamento.status);
  
  // Hook de Long Press
  const longPressProps = useLongPress(
    () => onLongPress(agendamento),
    () => onClick(agendamento),
    { delay: 600 }
  );

  // Lógica do Swipe (Arrastar)
  const handleDragEnd = async (event: any, info: PanInfo) => {
    const swipeThreshold = -150; // Distância necessária para ativar (negativo é para esquerda)
    
    // Só permite arrastar se estiver CONFIRMADO
    if (agendamento.status === "CONFIRMADO" && info.offset.x < swipeThreshold) {
      if (onConcluirSwipe) {
        // Dispara a ação de concluir
        onConcluirSwipe(agendamento);
        // Anima o card a sair da tela ou voltar (opcional, aqui ele volta ao centro)
        controls.start({ x: 0 });
      }
    } else {
      // Se não arrastou o suficiente, volta para o lugar
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg mb-2">
   
      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-end pr-4 rounded-lg">
        <div className="flex flex-col items-center text-emerald-500 font-bold animate-pulse">
          <Check size={24} />
          <span className="text-xs uppercase">Concluir</span>
        </div>
      </div>

      <motion.div
        drag={agendamento.status === "CONFIRMADO" ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.05 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="bg-background relative z-5"
        style={{ touchAction: "pan-y" }}
      >
        <Card
          {...longPressProps}
          className={`relative border-3 shadow-sm transition-all hover:shadow-md py-2 cursor-pointer select-none ${statusConfig.bgClass}`}
        >
          {/* ÍCONE DE STATUS (Canto Superior Direito) */}
          <div className="absolute top-2 right-2 opacity-80" title={agendamento.status}>
            {statusConfig.icon}
          </div>

          <CardContent className="p-3 flex justify-between items-center">
            {/* Informações */}
            <div className="flex flex-col pr-6">
              <span className="font-bold text-lg">
                <span className="flex flex-row items-center gap-1">
                  <Clock size={18} /> 
                  {format(new Date(agendamento.dataHora), "HH:mm")}
                </span>
              </span>
              
              <span className="font-medium text-foreground leading-tight">
                {agendamento.cliente?.nome || "Cliente"}
              </span>
              
              <span className="text-sm font-medium">
                {agendamento.servico?.nome || "Serviço"}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}