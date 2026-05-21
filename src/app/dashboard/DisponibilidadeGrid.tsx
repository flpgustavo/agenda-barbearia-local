"use client";

import type { GradeSemanal } from "@/core/services/AgendamentoService";
import { DayColumn } from "./DayColumn";

interface DisponibilidadeGridProps {
  grade: GradeSemanal;
  exportRef: React.RefObject<HTMLDivElement | null>;
  isExporting: boolean;
}

export function DisponibilidadeGrid({ grade, exportRef, isExporting }: DisponibilidadeGridProps) {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split("T")[0];

  return (
    <div ref={exportRef}>
      <div className={`pb-4 ${isExporting ? "" : ""}`}>
        <div className="flex flex-col gap-2">
          {grade.dias.map((dia) => (
            <DayColumn
              key={dia.data}
              dia={dia}
              isPast={dia.data < hojeStr}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
