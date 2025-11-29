import { BaseModel } from "./BaseModel";

export type AgendamentoStatus = 'CONCLUIDO' | 'CONFIRMADO' | 'CANCELADO';

export interface Agendamento extends BaseModel {
    clienteId: number;
    dataHora: string;
    servicosId: number[];
    status: AgendamentoStatus;
    observacoes?: string;
}
