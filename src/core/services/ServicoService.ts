import { BaseService } from "./BaseService";
import { Servico } from "../models/Servico";
import { db } from "../db";

class ServicoService extends BaseService<Servico> {
    constructor() {
        super("servicos" as keyof typeof db);
    }

    private async validarServico(
        data: Omit<Servico, "id" | "createdAt" | "updatedAt">,
        idAtual?: string
    ) {
        const { nome, duracaoMinutos, preco } = data;

        if (!nome || nome.trim().length === 0) {
            throw new Error("O nome do serviço é obrigatório.");
        }

        if (nome.trim().length < 3) {
            throw new Error("O nome do serviço deve ter pelo menos 3 caracteres.");
        }

        if (!duracaoMinutos || duracaoMinutos <= 0) {
            throw new Error("A duração do serviço deve ser maior que 0.");
        }

        if (preco !== undefined && preco < 0) {
            throw new Error("O preço não pode ser negativo.");
        }

        const existe = await this.table
            .where("nome")
            .equalsIgnoreCase(nome.trim())
            .first();

        if (existe && existe.id !== idAtual) {
            throw new Error("Já existe um serviço com esse nome.");
        }
    }

    private async validarExclusao(id: string): Promise<void> {
        const agendamentosAtivos = await db.agendamentos
            .where("servicoId")
            .equals(id)
            .filter(ag => ag.status !== "CANCELADO")
            .toArray();

        if (agendamentosAtivos.length > 0) {
            throw new Error(
                `Não é possível excluir este serviço. Existem ${agendamentosAtivos.length} agendamento(s) vinculado(s) a ele.`
            );
        }
    }

    async create(
        data: Omit<Servico, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        await this.validarServico(data);
        return super.create(data);
    }

    async update(id: string, data: Partial<Servico>): Promise<void> {
        const atual = await this.table.get(id);
        if (!atual) throw new Error("Serviço não encontrado.");

        const combinado = { ...atual, ...data };

        await this.validarServico(combinado, id);

        return super.update(id, data);
    }

    async remove(id: string): Promise<void> {
        await this.validarExclusao(id);
        return super.remove(id);
    }
}

export const servicoService = new ServicoService();