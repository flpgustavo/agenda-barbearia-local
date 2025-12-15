"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface para devolver os dados ao pai
interface DateRangeFilterProps {
  onFilterChange: (inicio: string, fim: string) => void;
  className?: string;
}

export function DateRangeFilter({ onFilterChange, className }: DateRangeFilterProps) {
  const [selectedOption, setSelectedOption] = useState("este_mes");
  
  // Estado local para inputs manuais
  const [customDates, setCustomDates] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // Função que calcula as datas baseada no Select
  const handleRangeChange = (value: string) => {
    setSelectedOption(value);
    
    const hoje = new Date();
    let inicio = "";
    let fim = "";

    switch (value) {
      case "este_mes":
        inicio = format(startOfMonth(hoje), "yyyy-MM-dd");
        fim = format(endOfMonth(hoje), "yyyy-MM-dd");
        break;
      case "mes_anterior":
        const mesPassado = subMonths(hoje, 1);
        inicio = format(startOfMonth(mesPassado), "yyyy-MM-dd");
        fim = format(endOfMonth(mesPassado), "yyyy-MM-dd");
        break;
      case "ultimos_3":
        inicio = format(startOfMonth(subMonths(hoje, 2)), "yyyy-MM-dd");
        fim = format(endOfMonth(hoje), "yyyy-MM-dd");
        break;
      case "ultimos_6":
        inicio = format(startOfMonth(subMonths(hoje, 5)), "yyyy-MM-dd");
        fim = format(endOfMonth(hoje), "yyyy-MM-dd");
        break;
      case "personalizado":
        inicio = customDates.start;
        fim = customDates.end;
        break;
    }

    if (value !== "personalizado") {
      setCustomDates({ start: inicio, end: fim });
      onFilterChange(inicio, fim);
    }
  };

  const handleManualDateChange = (field: 'start' | 'end', value: string) => {
    const newDates = { ...customDates, [field]: value };
    setCustomDates(newDates);
    onFilterChange(newDates.start, newDates.end);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Select value={selectedOption} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-full bg-background">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione o período" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="este_mes">Este mês</SelectItem>
          <SelectItem value="mes_anterior">Mês anterior</SelectItem>
          <SelectItem value="ultimos_3">Últimos 3 meses</SelectItem>
          <SelectItem value="ultimos_6">Últimos 6 meses</SelectItem>
          <SelectItem value="personalizado">Personalizado...</SelectItem>
        </SelectContent>
      </Select>

      {selectedOption === "personalizado" && (
        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300 p-3 border rounded-md bg-muted/20">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">De</Label>
            <Input 
              type="date" 
              value={customDates.start}
              onChange={(e) => handleManualDateChange('start', e.target.value)}
              className="bg-background h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Até</Label>
            <Input 
              type="date" 
              value={customDates.end}
              onChange={(e) => handleManualDateChange('end', e.target.value)}
              className="bg-background h-9 text-xs"
            />
          </div>
        </div>
      )}
      
      {/* Feedback visual discreto do período selecionado (opcional) */}
      {selectedOption !== "personalizado" && (
        <p className="text-[10px] text-center text-muted-foreground">
          {format(new Date(customDates.start), "dd/MM")} até {format(new Date(customDates.end), "dd/MM")}
        </p>
      )}
    </div>
  );
}