import { BaseModel } from "./BaseModel";

export type AgendamentoStatus = 'CONCLUIDO' | 'CONFIRMADO' | 'CANCELADO';

export interface Agendamento extends BaseModel {
    clienteId: string;
    dataHora: string;
    servicoId: string;
    status: AgendamentoStatus;
    observacoes?: string;
}
