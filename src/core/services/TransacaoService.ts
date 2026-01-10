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
        super("transacoes" as keyof typeof db);
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