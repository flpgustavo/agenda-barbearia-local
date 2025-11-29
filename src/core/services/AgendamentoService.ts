// src/core/services/AgendamentoService.ts
import { BaseService } from "./BaseService";
import { Agendamento } from "../models/Agendamento";
import { db } from "../db";
import { Servico } from "../models/Servico";
import { UsuarioService } from "./UsuarioService";

class _AgendamentoService extends BaseService<Agendamento> {
    constructor() {
        super("agendamentos");
    }

    /**
     * Regras extra ao criar agendamentos
     */
    async create(data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">): Promise<string> {
        // 1) Validar horário permitido
        await this.validateHorario(data);

        // 2) Validar conflito
        const conflito = await this.hasConflict(data.dataHora, data.servicosId);
        if (conflito) {
            throw new Error("Horário indisponível — existe outro agendamento no período.");
        }

        // 3) Criar via BaseService
        return super.create(data);
    }

    /**
     * Regra extra ao atualizar
     */
    async update(id: string, patch: Partial<Agendamento>): Promise<void> {
        if (patch.dataHora || patch.servicosId) {
            const atual = await this.get(id);
            if (!atual) throw new Error("Agendamento não encontrado.");

            const novo = {
                ...atual,
                ...patch
            };

            await this.validateHorario(novo);

            const conflito = await this.hasConflict(novo.dataHora, novo.servicosId, id);
            if (conflito) {
                throw new Error("Horário indisponível — conflito com outro agendamento.");
            }
        }

        return super.update(id, patch);
    }

    /**
     * Validação de expediente + intervalos de almoço
     */
    private async validateHorario(ag: Agendamento): Promise<void> {
        const usuario = await UsuarioService.get("1"); // único usuário do sistema

        if (!usuario) return;

        const inicioExpediente = new Date(`${ag.dataHora.split("T")[0]}T${usuario.inicio}`);
        const fimExpediente    = new Date(`${ag.dataHora.split("T")[0]}T${usuario.fim}`);

        const inicioAg = new Date(ag.dataHora);

        if (inicioAg < inicioExpediente || inicioAg > fimExpediente) {
            throw new Error("Horário fora do expediente.");
        }

        // Intervalo opcional
        if (usuario.intervaloInicio && usuario.intervaloFim) {
            const inicioInt = new Date(`${ag.dataHora.split("T")[0]}T${usuario.intervaloInicio}`);
            const fimInt    = new Date(`${ag.dataHora.split("T")[0]}T${usuario.intervaloFim}`);

            if (inicioAg >= inicioInt && inicioAg < fimInt) {
                throw new Error("Horário dentro do intervalo (almoço).");
            }
        }
    }

    /**
     * Verifica conflito real entre agendamentos
     */
    async hasConflict(dataHora: string, servicosIds: string[], ignoreId?: string): Promise<boolean> {
        const servicos: Servico[] = await db.servicos.where("id").anyOf(servicosIds).toArray();
        const duracaoTotal = servicos.reduce((acc, s) => acc + s.duracaoMinutos, 0);

        const inicioNovo = new Date(dataHora);
        const fimNovo = new Date(inicioNovo.getTime() + duracaoTotal * 60000);

        const todos = await db.agendamentos.toArray();

        for (const ag of todos) {
            if (ignoreId && ag.id === ignoreId) continue;

            const servsAg: Servico[] = await db.servicos
                .where("id")
                .anyOf(ag.servicosId)
                .toArray();

            const durAg = servsAg.reduce((acc, s) => acc + s.duracaoMinutos, 0);

            const inicioAg = new Date(ag.dataHora);
            const fimAg = new Date(inicioAg.getTime() + durAg * 60000);

            const conflita =
                (inicioNovo >= inicioAg && inicioNovo < fimAg) ||
                (fimNovo > inicioAg && fimNovo <= fimAg) ||
                (inicioAg >= inicioNovo && inicioAg < fimNovo);

            if (conflita) return true;
        }

        return false;
    }
}

export const agendamentoService = new _AgendamentoService();
