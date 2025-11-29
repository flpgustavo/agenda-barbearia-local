import { useBase } from "./useBase";
import { agendamentoService } from "../core/services/AgendamentoService";
import { Agendamento } from "../core/models/Agendamento";

export function useAgendamentos() {
    return useBase<Agendamento>(agendamentoService as unknown as any);
}
