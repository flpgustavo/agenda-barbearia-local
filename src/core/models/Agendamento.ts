export type AgendamentoStatus = 'CONCLUIDO' | 'CONFIRMADO' | 'CANCELADO';

export interface Agendamento {
    id: number;
    clienteId: number;
    dataHora: string; 
    servicosId: number[];
    status: AgendamentoStatus;
    observacoes?: string;
}