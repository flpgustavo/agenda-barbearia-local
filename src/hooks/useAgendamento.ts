import { useBase } from "./useBase";
import { AgendamentoComDetalhes, AgendamentoService } from "../core/services/AgendamentoService";
import { Agendamento } from "../core/models/Agendamento";
import { useCallback } from "react";

export function useAgendamento() {
    const base = useBase<Agendamento>(AgendamentoService);

    const verificarDisponibilidade = useCallback(async (data: Date) => {
        return await AgendamentoService.verificarDisponibilidadeDia(data);
    }, []);

    const buscarHorarios = useCallback(async (dataStr: string, duracao: number) => {
        return await AgendamentoService.gerarHorariosDisponiveis(dataStr, duracao, duracao);
    }, []);

    const agendamentos = useCallback(async () => {
        return await AgendamentoService.listWithDetails();
    }, []);

    return {
        ...base,
        verificarDisponibilidade,
        buscarHorarios,
        agendamentos
    };
}