import { BaseService } from "./BaseService";
import { Agendamento } from "../models/Agendamento";
import { db } from "../db";

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
        
        // Validação de passado (opcional: remove se quiseres permitir agendar ontem)
        // Nota: new Date() cria data atual local. Para comparar justo, convertemos para UTC string
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

        // 1. Validação: Fora do Expediente
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

        // 2. Validação: Intervalo de Almoço
        if (
            intervaloInicio !== null &&
            intervaloFim !== null
        ) {
            // Se começa DENTRO do intervalo
            if (horaMin >= intervaloInicio && horaMin < intervaloFim) {
                 throw new Error("Não é possível agendar no horário de intervalo.");
            }
            // Se começa antes mas TERMINA DENTRO ou DEPOIS do intervalo (atravessa)
            if (inicioNovo < intervaloInicio && fimNovo > intervaloInicio) {
                throw new Error("O serviço conflita com o horário de intervalo.");
            }
        }

        // 3. Validação: Conflito com outros agendamentos
        const agendamentosDoDia = await db.agendamentos
            .where("dataHora")
            .startsWith(dataAgendamentoStr) // Busca pelo dia YYYY-MM-DD
            .toArray();

        for (const ag of agendamentosDoDia) {
            // Ignora o próprio agendamento (caso seja edição)
            if (data.id && ag.id === data.id) continue;
            if (ag.status === "CANCELADO") continue;

            // Extrai hora do agendamento existente
            // O slice(11, 16) pega "HH:MM" da string ISO "...T14:00:00Z" -> "14:00"
            // Isso funciona perfeitamente com UTC
            const agMin = this.toMinutes(ag.dataHora.slice(11, 16));
            
            const agServico = await db.servicos.get(ag.servicoId);
            const agDuracao = agServico?.duracaoMinutos ?? 0;
            const agFim = agMin + agDuracao;

            // Lógica de colisão (Intersection)
            // (Novo Começa dentro do Antigo) OU (Novo Termina dentro do Antigo) OU (Novo Engloba o Antigo)
            const conflito =
                (inicioNovo >= agMin && inicioNovo < agFim) ||
                (fimNovo > agMin && fimNovo <= agFim) ||
                (inicioNovo <= agMin && fimNovo >= agFim);

            if (conflito) {
                throw new Error("Horário já está ocupado por outro agendamento.");
            }
        }
    }

    async verificarDisponibilidadeDia(data: Date): Promise<boolean> {
        // 1. Validar se é passado (opcional, mas recomendado)
        const agora = new Date();
        const hojeStr = agora.toISOString().split("T")[0];
        const dataStr = data.toISOString().split("T")[0];

        // Se a data for anterior a hoje, retorna false
        if (dataStr < hojeStr) return false;

        // 2. Buscar configurações do usuário (horários)
        const usuario = await db.usuarios.toCollection().first();
        if (!usuario) return false; // Sem configuração, sem agenda.

        const inicioExpediente = this.toMinutes(usuario.inicio);
        const fimExpediente = this.toMinutes(usuario.fim);

        // 3. Descobrir a duração do serviço mais curto
        const servicos = await db.servicos.toArray();
        if (servicos.length === 0) return false;

        // Encontramos o menor tempo necessário para um agendamento
        const menorDuracaoServico = Math.min(...servicos.map(s => s.duracaoMinutos));

        // 4. Buscar agendamentos do dia
        const agendamentos = await db.agendamentos
            .where("dataHora")
            .startsWith(dataStr)
            .toArray();

        // 5. Criar lista de intervalos ocupados (em minutos)
        let intervalosOcupados: { inicio: number; fim: number }[] = [];

        // Adiciona o intervalo de almoço como "ocupado"
        if (usuario.intervaloInicio && usuario.intervaloFim) {
            intervalosOcupados.push({
                inicio: this.toMinutes(usuario.intervaloInicio),
                fim: this.toMinutes(usuario.intervaloFim)
            });
        }

        // Adiciona os agendamentos existentes como "ocupados"
        for (const ag of agendamentos) {
            if (ag.status === "CANCELADO") continue;

            // Extrai a hora HH:MM do ISO string
            const hora = ag.dataHora.slice(11, 16);
            const inicio = this.toMinutes(hora);

            // Busca a duração deste agendamento específico
            const servicoAgendado = servicos.find(s => s.id === ag.servicoId);
            const duracao = servicoAgendado ? servicoAgendado.duracaoMinutos : 0;

            intervalosOcupados.push({ inicio, fim: inicio + duracao });
        }

        // Ordena os intervalos pelo horário de início
        intervalosOcupados.sort((a, b) => a.inicio - b.inicio);

        // 6. Algoritmo de Varredura (Sweep) para encontrar buracos
        // O cursor começa no início do expediente
        let cursorTempo = inicioExpediente;

        // Se for o dia de HOJE, o cursor não pode ser anterior a "agora"
        if (dataStr === hojeStr) {
            const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
            cursorTempo = Math.max(cursorTempo, minutosAgora);
        }

        for (const intervalo of intervalosOcupados) {
            // Calcula o espaço livre entre o cursor atual e o próximo bloqueio
            const espacoLivre = intervalo.inicio - cursorTempo;

            // Se o espaço livre for suficiente para o menor serviço, TEMOS VAGA!
            if (espacoLivre >= menorDuracaoServico) {
                return true;
            }

            // Avança o cursor para o final deste bloqueio (se for maior que o atual)
            cursorTempo = Math.max(cursorTempo, intervalo.fim);
        }

        // 7. Verificação final: Espaço entre o último agendamento e o fim do expediente
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

        // 1. Configurações básicas (Idealmente viriam do banco 'usuarios')
        const usuario = await db.usuarios.toCollection().first();
        // Fallback se não tiver config: 08:00 as 18:00
        const inicioExpediente = usuario ? this.toMinutes(usuario.inicio) : 480;
        const fimExpediente = usuario ? this.toMinutes(usuario.fim) : 1080;

        // Intervalos de almoço
        const intervaloInicio = usuario?.intervaloInicio ? this.toMinutes(usuario.intervaloInicio) : null;
        const intervaloFim = usuario?.intervaloFim ? this.toMinutes(usuario.intervaloFim) : null;

        // 2. Buscar agendamentos existentes no dia
        const agendamentos = await db.agendamentos
            .where("dataHora")
            .startsWith(dataStr)
            .toArray();

        // Filtra cancelados
        const agendamentosValidos = agendamentos.filter(a => a.status !== "CANCELADO");

        const horariosDisponiveis: string[] = [];

        // 3. Loop para testar cada horário do dia
        // Começa no início do expediente e avança de X em X minutos
        for (let tempoAtual = inicioExpediente; tempoAtual + duracaoMinutos <= fimExpediente; tempoAtual += passoMinutos) {

            const inicioSlot = tempoAtual;
            const fimSlot = tempoAtual + duracaoMinutos;

            let conflito = false;

            // A) Verifica conflito com Almoço
            if (intervaloInicio !== null && intervaloFim !== null) {
                // Se o serviço começa antes do almoço acabar E termina depois do almoço começar
                if (inicioSlot < intervaloFim && fimSlot > intervaloInicio) {
                    conflito = true;
                }
            }

            // B) Verifica conflito com Agendamentos Existentes
            if (!conflito) {
                for (const ag of agendamentosValidos) {
                    const horaAg = ag.dataHora.slice(11, 16); // "HH:MM"
                    const inicioAg = this.toMinutes(horaAg);

                    // Precisamos buscar a duração do serviço daquele agendamento para saber onde ele termina
                    const servicoAg = await db.servicos.get(ag.servicoId); // Nota: isto pode ser otimizado buscando todos servicos antes
                    const duracaoAg = servicoAg?.duracaoMinutos || 30;
                    const fimAg = inicioAg + duracaoAg;

                    // Lógica de colisão
                    if (inicioSlot < fimAg && fimSlot > inicioAg) {
                        conflito = true;
                        break;
                    }
                }
            }

            // 4. Se não houve conflito, adiciona à lista
            if (!conflito) {
                const h = Math.floor(tempoAtual / 60).toString().padStart(2, "0");
                const m = (tempoAtual % 60).toString().padStart(2, "0");
                horariosDisponiveis.push(`${h}:${m}`);
            }
        }

        return horariosDisponiveis;
    }

    async create(
        data: Omit<Agendamento, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
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