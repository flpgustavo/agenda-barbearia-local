"use client";

import type { DiaGrade } from "@/core/services/AgendamentoService";

interface DayColumnProps {
  dia: DiaGrade;
  isPast: boolean;
}

export function DayColumn({ dia, isPast }: DayColumnProps) {
  const ocup = dia.ocupacaoPercent;
  const total = dia.slotsLivres.length;
  const qtd = dia.totalSlots - dia.slotsOcupados;
  const barColor =
    ocup > 75 ? "bg-red-500" : ocup > 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className={`flex items-center gap-4 w-full border rounded-lg px-4 py-3 bg-card ${isPast ? "opacity-50" : ""}`}>
      <div className="min-w-[90px]">
        <p className="text-xs font-bold text-muted-foreground uppercase">{dia.diaSemana}</p>
        <p className="text-sm font-semibold">{dia.dataFormatada}</p>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
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
      </div>

      <div className="text-right min-w-[100px]">
        {isPast ? (
          <span className="text-xs text-muted-foreground italic">Indisponível</span>
        ) : total > 0 ? (
          <>
            <p className="text-lg font-bold text-foreground">{total}</p>
            <p className="text-[11px] text-muted-foreground">
              {total === 1 ? "horário livre" : "horários livres"}
            </p>
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">Lotado</span>
        )}
      </div>
    </div>
  );
}
