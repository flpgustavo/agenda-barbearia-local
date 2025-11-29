import { BaseService } from "./BaseService";
import { Servico } from "../models/Servico";
import { db } from "../db";

class ServicoServiceClass extends BaseService<Servico> {
    constructor() {
        super('servicos' as keyof typeof db);
    }

    //-----------------------------
    // 🔍 VALIDAÇÕES DO SERVIÇO
    //-----------------------------
    private async validarServico(data: Omit<Servico, "id" | "createdAt" | "updatedAt">) {
        const { nome, duracaoMinutos, preco } = data;

        // Nome obrigatório
        if (!nome || nome.trim().length === 0) {
            throw new Error("O nome do serviço é obrigatório.");
        }

        // Nome mínimo
        if (nome.trim().length < 3) {
            throw new Error("O nome do serviço deve ter pelo menos 3 caracteres.");
        }

        // Duração obrigatória
        if (!duracaoMinutos || duracaoMinutos <= 0) {
            throw new Error("A duração do serviço deve ser maior que 0.");
        }

        // Preço não pode ser negativo
        if (preco !== undefined && preco < 0) {
            throw new Error("O preço não pode ser negativo.");
        }

        // Nome único
        const existe = await this.table.where("nome").equalsIgnoreCase(nome.trim()).first();
        if (existe) {
            throw new Error("Já existe um serviço com esse nome.");
        }
    }

    //------------------------------------------
    // 🟢 CREATE COM VALIDAÇÕES ANTES DE SALVAR
    //------------------------------------------
    async create(data: Omit<Servico, "id" | "createdAt" | "updatedAt">): Promise<string> {
        await this.validarServico(data);
        return super.create(data);
    }

    //------------------------------------------
    // 🟡 UPDATE COM VALIDAÇÃO (exceto nome único do próprio registro)
    //------------------------------------------
    async update(id: string, data: Partial<Servico>): Promise<void> {

        if (data.nome) {
            const outro = await this.table
                .where("nome")
                .equalsIgnoreCase(data.nome.trim())
                .first();

            if (outro && outro.id !== id) {
                throw new Error("Já existe outro serviço com esse nome.");
            }
        }

        if (data.duracaoMinutos !== undefined && data.duracaoMinutos <= 0) {
            throw new Error("A duração do serviço deve ser maior que 0.");
        }

        if (data.preco !== undefined && data.preco < 0) {
            throw new Error("O preço não pode ser negativo.");
        }

        return super.update(id, data);
    }
}

export const ServicoService = new ServicoServiceClass();
