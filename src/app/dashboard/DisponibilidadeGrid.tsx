"use client";

import { useRef } from "react";
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
      <div className={`overflow-x-auto pb-4 ${isExporting ? "min-w-[980px]" : ""}`}>
        <div className="flex gap-3 min-w-max">
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
