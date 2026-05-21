"use client";

import { useQuery } from "@tanstack/react-query";
import { AgendamentoService, GradeSemanal } from "@/core/services/AgendamentoService";
import { queryKeys } from "@/lib/queryKeys";
import { startOfWeek, addWeeks } from "date-fns";

export function useAvailabilityGrid(servicoId: string | null, weekOffset: number) {
    const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });

    const { data, isLoading, error } = useQuery<GradeSemanal>({
        queryKey: [...queryKeys.gradeDisponibilidade, servicoId, weekStart.toISOString()],
        queryFn: () => AgendamentoService.gerarGradeSemanal(servicoId!, weekStart),
        enabled: !!servicoId,
    });

    return {
        grade: data ?? null,
        loading: isLoading,
        error: error ? (error as Error).message : null,
        semanaLabel: data?.semanaLabel ?? "",
    };
}
