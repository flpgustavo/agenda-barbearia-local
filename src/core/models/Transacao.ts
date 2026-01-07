import { BaseModel } from "./BaseModel";

export type TransacaoStatus = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO';

export interface Transacao extends BaseModel {
    clienteId: string;
    dataHora: string;
    servicoId: string;
    status: TransacaoStatus;
    valor: number;
    observacoes?: string;
}
