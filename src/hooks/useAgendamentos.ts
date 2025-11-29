import { useBase } from "./useBase";
import { AgendamentoService } from "../core/services/AgendamentoService";
import { Agendamento } from "../core/models/Agendamento";

export function useAgendamentos() {
    return useBase<Agendamento>(AgendamentoService as unknown as any);
}
