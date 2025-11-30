import { BaseService } from "./BaseService";
import { Agendamento } from "../models/Agendamento";
import { db } from "../db";
import { ServicoService } from "./ServicoService";
import { ClienteService } from "./ClienteService";

class AgendamentoServiceClass extends BaseService<Agendamento> {
    constructor() {
        super("agendamentos" as keyof typeof db);
    }

    private toMinutes(hora: string): number {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

   private async validarAgendamento(data: Partial<Agendamento>) {
    const { clienteId, servicosId, dataHora } = data;

    const cliente = await db.clientes.get(clienteId!);
    if (!cliente) {
        throw new Error("Cliente não encontrado.");
    }

    const servico = await db.servicos.get(servicosId!);
    if (!servico) {
        throw new Error("Serviço não encontrado.");
    }

    const dt = new Date(dataHora!);
    if (isNaN(dt.getTime())) {
        throw new Error("Data e hora inválidas.");
    }
    if (dt < new Date()) {
        throw new Error("Não é possível agendar para o passado.");
    }

    const usuario = await db.usuarios.toCollection().first();
    if (!usuario) {
        throw new Error("Configure seu horário de atendimento antes de criar agendamentos.");
    }

    // 5) Validar horário dentro do expediente
    const hora = dt.toTimeString().slice(0, 5);

    const inicio = this.toMinutes(usuario.inicio);
    const fim = this.toMinutes(usuario.fim);
    const intervaloInicio = this.toMinutes(usuario.intervaloInicio);
    const intervaloFim = this.toMinutes(usuario.intervaloFim);
    const horaMin = this.toMinutes(hora);

    if (horaMin < inicio || horaMin > fim) {
        throw new Error("Horário fora do expediente de trabalho.");
    }

    if (horaMin >= intervaloInicio && horaMin < intervaloFim) {
        throw new Error("Não é possível agendar no horário de intervalo.");
    }

    // 6) Validar conflitos
    const duracaoServico = servico.duracaoMinutos;
    const inicioNovo = horaMin;
    const fimNovo = horaMin + duracaoServico;

    const agendamentosDoDia = await db.agendamentos
        .where("dataHora")
        .startsWith(dt.toISOString().split("T")[0])
        .toArray();

    for (const ag of agendamentosDoDia) {
        if (data.id && ag.id === data.id) continue; // agora funciona

        const agMin = this.toMinutes(ag.dataHora.slice(11, 16));
        const agFim = agMin + (await db.servicos.get(ag.servicosId))!.duracaoMinutos;

        const conflito =
            (inicioNovo >= agMin && inicioNovo < agFim) ||
            (fimNovo > agMin && fimNovo <= agFim) ||
            (inicioNovo <= agMin && fimNovo >= agFim);

        if (conflito) {
            throw new Error("Horário já está ocupado por outro agendamento.");
        }
    }
}


    //-------------------------------------
    // 🟢 CREATE
    //-------------------------------------
    async create(data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">): Promise<string> {
        await this.validarAgendamento(data);
        return super.create(data);
    }

    //-------------------------------------
    // 🟡 UPDATE
    //-------------------------------------
    async update(id: string, data: Partial<Agendamento>): Promise<void> {
        const atual = await this.table.get(id);
        if (!atual) throw new Error("Agendamento não encontrado.");

        // Mescla para validar
        const combinado = { ...atual, ...data };

        await this.validarAgendamento(combinado);
        return super.update(id, data);
    }
}

export const AgendamentoService = new AgendamentoServiceClass();
