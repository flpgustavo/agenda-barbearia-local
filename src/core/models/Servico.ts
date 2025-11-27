export interface servico {
    id: number;
    clienteId: number;
    nome: string;
    duracaoMinutos: number;
    preco?: number;
}