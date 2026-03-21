import { useBase } from "./useBase";
import { AgendamentoService } from "../core/services/AgendamentoService";
import { Agendamento } from "../core/models/Agendamento";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";

export function useAgendamento() {
    const base = useBase<Agendamento>(AgendamentoService, queryKeys.agendamentos);
    const queryClient = useQueryClient();

    const originalCriar = base.criar;
    const originalAtualizar = base.atualizar;
    const originalRemover = base.remover;

    const criar = useCallback(async (data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">) => {
        const id = await originalCriar(data);
        queryClient.invalidateQueries({ queryKey: queryKeys.agendamentosDetalhes });
        return id;
    }, [originalCriar, queryClient]);

    const atualizar = useCallback(async (id: string, data: Partial<Agendamento>) => {
        await originalAtualizar(id, data);
        queryClient.invalidateQueries({ queryKey: queryKeys.agendamentosDetalhes });
    }, [originalAtualizar, queryClient]);

    const remover = useCallback(async (id: string) => {
        await originalRemover(id);
        queryClient.invalidateQueries({ queryKey: queryKeys.agendamentosDetalhes });
    }, [originalRemover, queryClient]);

    const verificarDisponibilidade = useCallback(async (data: Date) => {
        return await AgendamentoService.verificarDisponibilidadeDia(data);
    }, []);

    const buscarHorarios = useCallback(async (dataStr: string, duracao: number) => {
        return await AgendamentoService.gerarHorariosDisponiveis(dataStr, duracao, duracao);
    }, []);

    const agendamentos = useCallback(async () => {
        return await AgendamentoService.listWithDetails();
    }, []);

    const getDetails = useCallback(async (id: string) => {
        return await AgendamentoService.getDetails(id);
    }, []);

    return {
        ...base,
        criar,
        atualizar,
        remover,
        verificarDisponibilidade,
        buscarHorarios,
        agendamentos,
        getDetails
    };
}