import { BaseService } from "./BaseService";
import { Agendamento } from "../models/Agendamento";
import { db } from "../db";

export interface AgendamentoComDetalhes extends Agendamento {
    cliente?: any;
    servico?: any;
}

class AgendamentoServiceClass extends BaseService<Agendamento> {
    constructor() {
        super("agendamentos" as keyof typeof db);
    }

    private toMinutes(hora: string): number {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    private async validarAgendamento(data: Partial<Agendamento>) {
        const { clienteId, servicoId, dataHora } = data;

        const cliente = await db.clientes.get(clienteId!);
        if (!cliente) {
            throw new Error("Cliente não encontrado.");
        }

        const servico = await db.servicos.get(servicoId!);
        if (!servico) {
            throw new Error("Serviço não encontrado.");
        }

        const dt = new Date(dataHora!);
        if (isNaN(dt.getTime())) {
            throw new Error("Data e hora inválidas.");
        }

        // Validação de passado (opcional)
        if (dt.toISOString() < new Date().toISOString()) {
            // throw new Error("Não é possível agendar para o passado.");
        }

        const usuario = await db.usuarios.toCollection().first();
        if (!usuario) {
            throw new Error("Configure seu horário de atendimento antes de criar agendamentos.");
        }

        const horaMin = dt.getUTCHours() * 60 + dt.getUTCMinutes();
        const dataAgendamentoStr = dataHora!.split("T")[0];

        const inicio = this.toMinutes(usuario.inicio);
        const fim = this.toMinutes(usuario.fim);
        const intervaloInicio = usuario.intervaloInicio
            ? this.toMinutes(usuario.intervaloInicio)
            : null;
        const intervaloFim = usuario.intervaloFim
            ? this.toMinutes(usuario.intervaloFim)
            : null;

        const duracaoServico = servico.duracaoMinutos;
        const inicioNovo = horaMin;
        const fimNovo = horaMin + duracaoServico;

        // 1. Fora do expediente
        if (horaMin < inicio || horaMin >= fim) {
            throw new Error("Horário de início fora do expediente de trabalho.");
        }

        if (fimNovo > fim) {
            throw new Error(
                `O serviço termina às ${Math.floor(fimNovo / 60)
                    .toString()
                    .padStart(2, "0")}:${(fimNovo % 60)
                        .toString()
                        .padStart(2, "0")}, fora do expediente.`
            );
        }

        // 2. Intervalo de almoço
        if (intervaloInicio !== null && intervaloFim !== null) {
            if (horaMin >= intervaloInicio && horaMin < intervaloFim) {
                throw new Error("Não é possível agendar no horário de intervalo.");
            }

            if (inicioNovo < intervaloInicio && fimNovo > intervaloInicio) {
                throw new Error("O serviço conflita com o horário de intervalo.");
            }
        }

        // 3. Conflito com outros agendamentos
        const agendamentosDoDia = await db.agendamentos
            .where("dataHora")
            .startsWith(dataAgendamentoStr)
            .toArray();

        for (const ag of agendamentosDoDia) {
            if (data.id && ag.id === data.id) continue;
            if (ag.status === "CANCELADO") continue;

            const agMin = this.toMinutes(ag.dataHora.slice(11, 16));

            const agServico = await db.servicos.get(ag.servicoId);
            const agDuracao = agServico?.duracaoMinutos ?? 0;
            const agFim = agMin + agDuracao;

            const conflito =
                (inicioNovo >= agMin && inicioNovo < agFim) ||
                (fimNovo > agMin && fimNovo <= agFim) ||
                (inicioNovo <= agMin && fimNovo >= agFim);

            if (conflito) {
                throw new Error("Horário já está ocupado por outro agendamento.");
            }
        }
    }

    // NOVO: lista agendamentos trazendo cliente e serviço associados
    async listWithDetails(): Promise<
        AgendamentoComDetalhes[]
    > {
        const agendamentos = await this.list();

        const agendamentosComDetalhes = await Promise.all(
            agendamentos.map(async (agendamento) => {
                const cliente = await db.clientes.get(agendamento.clienteId);
                const servico = await db.servicos.get(agendamento.servicoId);

                return {
                    ...agendamento,
                    cliente,
                    servico,
                };
            })
        );

        return agendamentosComDetalhes;
    }

    async verificarDisponibilidadeDia(data: Date): Promise<boolean> {
        const agora = new Date();
        const hojeStr = agora.toISOString().split("T")[0];
        const dataStr = data.toISOString().split("T")[0];

        if (dataStr < hojeStr) return false;

        const usuario = await db.usuarios.toCollection().first();
        if (!usuario) return false;

        const inicioExpediente = this.toMinutes(usuario.inicio);
        const fimExpediente = this.toMinutes(usuario.fim);

        const servicos = await db.servicos.toArray();
        if (servicos.length === 0) return false;

        const menorDuracaoServico = Math.min(...servicos.map((s) => s.duracaoMinutos));

        const agendamentos = await db.agendamentos
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

            const hora = ag.dataHora.slice(11, 16);
            const inicio = this.toMinutes(hora);

            const servicoAgendado = servicos.find((s) => s.id === ag.servicoId);
            const duracao = servicoAgendado ? servicoAgendado.duracaoMinutos : 0;

            intervalosOcupados.push({ inicio, fim: inicio + duracao });
        }

        intervalosOcupados.sort((a, b) => a.inicio - b.inicio);

        let cursorTempo = inicioExpediente;

        if (dataStr === hojeStr) {
            const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
            cursorTempo = Math.max(cursorTempo, minutosAgora);
        }

        for (const intervalo of intervalosOcupados) {
            const espacoLivre = intervalo.inicio - cursorTempo;

            if (espacoLivre >= menorDuracaoServico) {
                return true;
            }

            cursorTempo = Math.max(cursorTempo, intervalo.fim);
        }

        if (fimExpediente - cursorTempo >= menorDuracaoServico) {
            return true;
        }

        return false;
    }

    async gerarHorariosDisponiveis(
        dataStr: string,
        duracaoMinutos: number,
        passoMinutos: number = 30
    ): Promise<string[]> {
        const usuario = await db.usuarios.toCollection().first();
        const inicioExpediente = usuario ? this.toMinutes(usuario.inicio) : 480;
        const fimExpediente = usuario ? this.toMinutes(usuario.fim) : 1080;

        const intervaloInicio = usuario?.intervaloInicio
            ? this.toMinutes(usuario.intervaloInicio)
            : null;
        const intervaloFim = usuario?.intervaloFim
            ? this.toMinutes(usuario.intervaloFim)
            : null;

        const agendamentos = await db.agendamentos
            .where("dataHora")
            .startsWith(dataStr)
            .toArray();

        const agendamentosValidos = agendamentos.filter((a) => a.status !== "CANCELADO");

        const horariosDisponiveis: string[] = [];

        for (
            let tempoAtual = inicioExpediente;
            tempoAtual + duracaoMinutos <= fimExpediente;
            tempoAtual += passoMinutos
        ) {
            const inicioSlot = tempoAtual;
            const fimSlot = tempoAtual + duracaoMinutos;

            let conflito = false;

            // A) Conflito com almoço
            if (intervaloInicio !== null && intervaloFim !== null) {
                if (inicioSlot < intervaloFim && fimSlot > intervaloInicio) {
                    conflito = true;
                }
            }

            // B) Conflito com agendamentos existentes
            if (!conflito) {
                for (const ag of agendamentosValidos) {
                    const horaAg = ag.dataHora.slice(11, 16);
                    const inicioAg = this.toMinutes(horaAg);

                    const servicoAg = await db.servicos.get(ag.servicoId);
                    const duracaoAg = servicoAg?.duracaoMinutos || 30;
                    const fimAg = inicioAg + duracaoAg;

                    if (inicioSlot < fimAg && fimSlot > inicioAg) {
                        conflito = true;
                        break;
                    }
                }
            }

            if (!conflito) {
                const h = Math.floor(tempoAtual / 60)
                    .toString()
                    .padStart(2, "0");
                const m = (tempoAtual % 60).toString().padStart(2, "0");
                horariosDisponiveis.push(`${h}:${m}`);
            }
        }

        return horariosDisponiveis;
    }

    async create(
        data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        console.log(data);
        await this.validarAgendamento(data);
        return super.create(data);
    }

    async update(id: string, data: Partial<Agendamento>): Promise<void> {
        const atual = await this.table.get(id);
        if (!atual) throw new Error("Agendamento não encontrado.");

        const combinado = { ...atual, ...data };

        await this.validarAgendamento(combinado);
        return super.update(id, data);
    }
}

export const AgendamentoService = new AgendamentoServiceClass();