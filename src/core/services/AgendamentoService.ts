import { BaseService } from "./BaseService";
import { Agendamento } from "../models/Agendamento";
import { getDb } from "../db";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";


export interface AgendamentoComDetalhes extends Agendamento {
    cliente?: Cliente;
    servico?: Servico;
}

class AgendamentoServiceClass extends BaseService<Agendamento> {
    constructor() {
        super("agendamentos");
    }

    private toMinutes(hora: string): number {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    private dateToMinutes(date: Date): number {
        return date.getHours() * 60 + date.getMinutes();
    }

    private async validarAgendamento(data: Partial<Agendamento>) {
        const { clienteId, servicoId, dataHora } = data;

        if (!clienteId || !servicoId || !dataHora) {
            throw new Error("Dados do agendamento incompletos.");
        }

        const cliente = await getDb().clientes.get(clienteId);
        if (!cliente) {
            throw new Error("Cliente não encontrado.");
        }

        const servico = await getDb().servicos.get(servicoId);
        if (!servico) {
            throw new Error("Serviço não encontrado.");
        }

        const dt = new Date(dataHora);
        if (isNaN(dt.getTime())) {
            throw new Error("Data e hora inválidas.");
        }

        const usuario = await getDb().usuarios.toCollection().first();
        if (!usuario) {
            throw new Error("Configure seu horário de atendimento antes de criar agendamentos.");
        }

        const horaInicioNovo = this.dateToMinutes(dt);
        const duracaoServico = servico.duracaoMinutos;
        const horaFimNovo = horaInicioNovo + duracaoServico;

        const inicioExpediente = this.toMinutes(usuario.inicio);
        const fimExpediente = this.toMinutes(usuario.fim);

        const intervaloInicio = usuario.intervaloInicio
            ? this.toMinutes(usuario.intervaloInicio)
            : null;

        const intervaloFim = usuario.intervaloFim
            ? this.toMinutes(usuario.intervaloFim)
            : null;

        const dataAgendamentoStr = dataHora.split("T")[0];

        if (horaInicioNovo < inicioExpediente || horaInicioNovo >= fimExpediente) {
            throw new Error("Horário de início fora do expediente.");
        }

        if (horaFimNovo > fimExpediente) {
            throw new Error("O serviço termina fora do horário de expediente.");
        }

        if (intervaloInicio !== null && intervaloFim !== null) {
            const conflitoIntervalo =
                horaInicioNovo < intervaloFim &&
                horaFimNovo > intervaloInicio;

            if (conflitoIntervalo) {
                throw new Error("O horário conflita com o intervalo.");
            }
        }

        const agendamentosDoDia = await getDb().agendamentos
            .where("dataHora")
            .startsWith(dataAgendamentoStr)
            .toArray();

        for (const ag of agendamentosDoDia) {
            if (data.id && ag.id === data.id) continue;
            if (ag.status === "CANCELADO") continue;

            const inicioAg = this.toMinutes(ag.dataHora.slice(11, 16));

            const servicoAg = await getDb().servicos.get(ag.servicoId);
            const duracaoAg = servicoAg?.duracaoMinutos ?? 0;
            const fimAg = inicioAg + duracaoAg;

            const conflito =
                horaInicioNovo < fimAg &&
                horaFimNovo > inicioAg;

            if (conflito) {
                throw new Error("Horário já ocupado por outro agendamento.");
            }
        }
    }

    private async validarAgendamentoPassado(id: string): Promise<void> {
        const agendamento = await this.table.get(id);
        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        if (agendamento.status === "CONCLUIDO") {
            throw new Error(
                "Não é possível alterar agendamentos que já foram concluídos."
            );
        }

        if (agendamento.status === "CANCELADO") {
            throw new Error(
                "Não é possível alterar agendamentos que já foram cancelados."
            );
        }
    }

    async listWithDetails(): Promise<AgendamentoComDetalhes[]> {
        const agendamentos = await this.list();

        return Promise.all(
            agendamentos.map(async (ag) => {
                const cliente = await getDb().clientes.get(ag.clienteId);
                const servico = await getDb().servicos.get(ag.servicoId);

                return {
                    ...ag,
                    cliente,
                    servico,
                };
            })
        );
    }

    async getDetails(id: string): Promise<AgendamentoComDetalhes> {
        const ag = await this.get(id);

        if (!ag) {
            throw new Error("Agendamento não encontrado.");
        }

        const cliente = await getDb().clientes.get(ag.clienteId);
        const servico = await getDb().servicos.get(ag.servicoId);

        return {
            ...ag,
            cliente,
            servico,
        };

    }

    async verificarDisponibilidadeDia(data: Date): Promise<boolean> {
        const hoje = new Date();
        const dataStr = data.toISOString().split("T")[0];
        const hojeStr = hoje.toISOString().split("T")[0];

        if (dataStr < hojeStr) return false;

        const usuario = await getDb().usuarios.toCollection().first();
        if (!usuario) return false;

        const inicioExpediente = this.toMinutes(usuario.inicio);
        const fimExpediente = this.toMinutes(usuario.fim);

        const servicos = await getDb().servicos.toArray();
        if (servicos.length === 0) return false;

        const menorDuracao = Math.min(...servicos.map((s: { duracaoMinutos: any; }) => s.duracaoMinutos));

        const agendamentos = await getDb().agendamentos
            .where("dataHora")
            .startsWith(dataStr)
            .toArray();

        let intervalosOcupados: { inicio: number; fim: number }[] = [];

        if (usuario.intervaloInicio && usuario.intervaloFim) {
            intervalosOcupados.push({
                inicio: this.toMinutes(usuario.intervaloInicio),
                fim: this.toMinutes(usuario.intervaloFim),
            });
        }

        for (const ag of agendamentos) {
            if (ag.status === "CANCELADO") continue;

            const inicio = this.toMinutes(ag.dataHora.slice(11, 16));
            const servico = servicos.find((s: Servico) => s.id === ag.servicoId);
            const duracao = servico?.duracaoMinutos ?? 0;

            intervalosOcupados.push({ inicio, fim: inicio + duracao });
        }

        intervalosOcupados.sort((a, b) => a.inicio - b.inicio);

        let cursor = inicioExpediente;

        if (dataStr === hojeStr) {
            const agoraMin = hoje.getHours() * 60 + hoje.getMinutes();
            cursor = Math.max(cursor, agoraMin);
        }

        for (let i = 0; i < intervalosOcupados.length; i++) {
            const intervalo = intervalosOcupados[i];
            if (intervalo.inicio - cursor >= menorDuracao && i !== intervalosOcupados.length - 1) {
                return true;
            }
            cursor = Math.max(cursor, intervalo.fim);
        }

        return fimExpediente - cursor >= menorDuracao;
    }

    async gerarHorariosDisponiveis(
        dataStr: string,
        duracaoMinutos: number,
        passoMinutos = 30
    ): Promise<string[]> {
        const usuario = await getDb().usuarios.toCollection().first();
        if (!usuario) return [];

        const inicioExpediente = this.toMinutes(usuario.inicio);
        const fimExpediente = this.toMinutes(usuario.fim);

        const intervaloInicio = usuario.intervaloInicio
            ? this.toMinutes(usuario.intervaloInicio)
            : null;

        const intervaloFim = usuario.intervaloFim
            ? this.toMinutes(usuario.intervaloFim)
            : null;

        const agendamentos = await getDb().agendamentos
            .where("dataHora")
            .startsWith(dataStr)
            .toArray();

        const horarios: string[] = [];

        for (
            let tempo = inicioExpediente;
            tempo + duracaoMinutos <= fimExpediente;
            tempo += passoMinutos
        ) {
            const inicioSlot = tempo;
            const fimSlot = tempo + duracaoMinutos;

            let conflito = false;

            if (
                intervaloInicio !== null &&
                intervaloFim !== null &&
                inicioSlot < intervaloFim &&
                fimSlot > intervaloInicio
            ) {
                conflito = true;
            }

            for (const ag of agendamentos) {
                if (ag.status === "CANCELADO") continue;

                const inicioAg = this.toMinutes(ag.dataHora.slice(11, 16));
                const servicoAg = await getDb().servicos.get(ag.servicoId);
                const fimAg = inicioAg + (servicoAg?.duracaoMinutos ?? 0);

                if (inicioSlot < fimAg && fimSlot > inicioAg) {
                    conflito = true;
                    break;
                }
            }

            if (!conflito) {
                const h = Math.floor(tempo / 60).toString().padStart(2, "0");
                const m = (tempo % 60).toString().padStart(2, "0");
                horarios.push(`${h}:${m}`);
            }
        }

        return horarios;
    }

    async create(
        data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        await this.validarAgendamento(data);
        return super.create(data);
    }

    async update(id: string, data: Partial<Agendamento>): Promise<void> {
        try {
            await this.validarAgendamentoPassado(id);

            const atual = await this.table.get(id);
            if (!atual) throw new Error("Agendamento não encontrado.");

            await this.validarAgendamento({ ...atual, ...data });
            await super.update(id, data);
        } catch (error) {
            throw error;
        }
    }
}

export const AgendamentoService = new AgendamentoServiceClass();