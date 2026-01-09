import { BaseService } from "./BaseService";
import { db } from "../db";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";
import { Transacao } from "../models/Transacao";

export interface TransacaoComDetalhes extends Transacao {
    cliente?: Cliente;
    servico?: Servico;
}

export class TransacaoService extends BaseService<Transacao> {
    constructor() {
        super("agendamentos" as keyof typeof db);
    }

    async listWithDetails(): Promise<TransacaoComDetalhes[]> {
        const agendamentos = await this.list();

        return Promise.all(
            agendamentos.map(async (ag) => {
                const cliente = await db.clientes.get(ag.clienteId);
                const servico = await db.servicos.get(ag.servicoId);

                return {
                    ...ag,
                    cliente,
                    servico,
                };
            })
        );
    }

    async getDetails(id: string): Promise<TransacaoComDetalhes> {
        const ag = await this.get(id);

        if (!ag) {
            throw new Error("Agendamento não encontrado.");
        }

        const cliente = await db.clientes.get(ag.clienteId);
        const servico = await db.servicos.get(ag.servicoId);

        return {
            ...ag,
            cliente,
            servico,
        };

    }

   

    async create(
        data: Omit<Transacao, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        await this.validarTransacao(data);
        return super.create(data);
    }
    async validarTransacao(data: Partial<Transacao>) {

        if (!data.dataHora) {
            throw new Error("A data e hora da transação são obrigatórias.");
        }

        if (!data.status) {
            throw new Error("O status da transação é obrigatório.");
        }

        if (!data.valor || data.valor < 0) {
            throw new Error("O valor da transação não pode ser negativo.");
        }
        if (!data.clienteId) {
            throw new Error("O cliente é obrigatório.");
        }
        if (!data.servicoId) {
            throw new Error("O serviço é obrigatório.");
        }
        return;
    }

    async update(id: string, data: Partial<Transacao>): Promise<void> {
        try {

            const atual = await this.table.get(id);
            if (!atual) throw new Error("Transação não encontrado.");
            await this.validarTransacao(data);

            await super.update(id, data);
        } catch (error) {
            throw error;
        }
    }
}

export const transacaoService = new TransacaoService();