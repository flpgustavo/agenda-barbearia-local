"use client";

import { useState, useRef, useCallback } from "react";
import { useServico } from "@/hooks/useServico";
import { useAvailabilityGrid } from "@/hooks/useAvailabilityGrid";
import { toBlob } from "html-to-image";
import { ServiceSelectorRow } from "./ServiceSelectorRow";
import { WeekNavigator } from "./WeekNavigator";
import { DisponibilidadeGrid } from "./DisponibilidadeGrid";
import { DisponibilidadeSkeleton } from "./DisponibilidadeSkeleton";
import { toast } from "sonner";

export function DisponibilidadeTab() {
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { items: servicos, loading: loadingServicos } = useServico();
  const { grade, loading, error, semanaLabel } = useAvailabilityGrid(servicoId, weekOffset);

  // Auto-select first service when services load and none selected
  const handleServiceSelect = useCallback((id: string) => {
    setServicoId(id);
  }, []);

  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);

    try {
      const blob = await toBlob(exportRef.current, {
        cacheBust: true,
        backgroundColor: `hsl(${getComputedStyle(document.documentElement)
          .getPropertyValue("--card")})`,
        pixelRatio: 2,
      });

      if (!blob) throw new Error("Falha ao gerar imagem.");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `disponibilidade-${semanaLabel.replace(/\//g, "-")}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Imagem exportada com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar a imagem.");
    } finally {
      setIsExporting(false);
    }
  };

  // Estado vazio: sem serviços cadastrados
  if (!loadingServicos && servicos.length === 0) {
    return (
      <div className="p-4">
        <ServiceSelectorRow servicos={[]} servicoId={null} onSelect={() => {}} />
      </div>
    );
  }

  // Estado: nenhum serviço selecionado ainda
  if (!servicoId && !loadingServicos) {
    return (
      <div className="p-4 space-y-4">
        <ServiceSelectorRow
          servicos={servicos}
          servicoId={null}
          onSelect={handleServiceSelect}
        />
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">Selecione um serviço para ver a disponibilidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Seletor de serviço */}
      <ServiceSelectorRow
        servicos={servicos}
        servicoId={servicoId}
        onSelect={handleServiceSelect}
      />

      {/* Barra de navegação + export */}
      <WeekNavigator
        semanaLabel={grade?.semanaLabel ?? semanaLabel}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Grid de disponibilidade ou loading ou erro */}
      {error && (
        <div className="p-4 rounded bg-destructive/15 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <DisponibilidadeSkeleton />
      ) : grade ? (
        <DisponibilidadeGrid
          grade={grade}
          exportRef={exportRef}
          isExporting={isExporting}
        />
      ) : null}
    </div>
  );
}
