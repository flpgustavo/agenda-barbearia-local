"use client";

import type { DiaGrade } from "@/core/services/AgendamentoService";

interface DayColumnProps {
  dia: DiaGrade;
  isPast: boolean;
}

export function DayColumn({ dia, isPast }: DayColumnProps) {
  const ocup = dia.ocupacaoPercent;
  const barColor =
    ocup > 75 ? "bg-red-500" : ocup > 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className={`flex flex-col w-[130px] shrink-0 border rounded-lg p-3 bg-card ${isPast ? "opacity-50" : ""}`}>
      {/* Cabeçalho: nome do dia + data */}
      <div className="text-center mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">{dia.diaSemana}</p>
        <p className="text-sm font-semibold">{dia.dataFormatada}</p>
      </div>

      {/* Indicador de ocupação */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Ocupação</span>
          <span className="font-semibold">{ocup}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(ocup, 100)}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-2" />

      {/* Chips de horários livres */}
      <div className="flex flex-wrap gap-1">
        {dia.slotsLivres.length > 0 ? (
          dia.slotsLivres.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-background text-foreground"
            >
              {slot}
            </span>
          ))
        ) : (
          <p className="text-[10px] text-muted-foreground italic w-full text-center py-2">
            {isPast ? "Indisponível" : "Lotado"}
          </p>
        )}
      </div>
    </div>
  );
}
