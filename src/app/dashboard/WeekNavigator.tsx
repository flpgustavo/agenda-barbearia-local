"use client";

import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekNavigatorProps {
  semanaLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export function WeekNavigator({ semanaLabel, onPrevWeek, onNextWeek, onExport, isExporting }: WeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevWeek} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold whitespace-nowrap">{semanaLabel}</span>
        <Button variant="outline" size="icon" onClick={onNextWeek} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="gap-1"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
    </div>
  );
}
