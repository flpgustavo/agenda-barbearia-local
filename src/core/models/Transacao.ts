import { BaseModel } from "./BaseModel";

export type TransacaoStatus = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO';

export interface Transacao extends BaseModel {
    dataHora: string;
    agendamentoId?: string;
    tipo: 'ENTRADA' | 'SAIDA';
    status: TransacaoStatus;
    valor: number;
    observacoes?: string;
}
