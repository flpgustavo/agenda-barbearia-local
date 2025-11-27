export type AgendamentoStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';

export interface Agendamento {
    id: number;
    clienteId: number;
    dataHora: string; 
    servico: string;
    status: AgendamentoStatus;
    observacoes?: string;
}