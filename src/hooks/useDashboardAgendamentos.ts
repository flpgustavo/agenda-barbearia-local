import { useEffect, useMemo, useState } from "react";
import { AgendamentoStatus } from "../core/models/Agendamento";
import { AgendamentoService, AgendamentoComDetalhes } from "../core/services/AgendamentoService";

export interface DashboardFilters {
    dataInicio?: string; 
    dataFim?: string;   
    status?: AgendamentoStatus[];
    clienteId?: string;
    servicoId?: string;
}

function parseDate(dateStr: string) {
    return new Date(dateStr);
}

function sameOrAfter(a: Date, b: Date) {
    return a.getTime() >= b.getTime();
}

function sameOrBefore(a: Date, b: Date) {
    return a.getTime() <= b.getTime();
}

function diffDays(a: Date, b: Date) {
    return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function diffMonths(a: Date, b: Date) {
    return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
}

export function useDashboardAgendamentos(filters: DashboardFilters) {
    const [agendamentos, setAgendamentos] = useState<AgendamentoComDetalhes[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function carregar() {
        try {
            setLoading(true);
            const data = await AgendamentoService.listWithDetails();
            setAgendamentos(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar agendamentos");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    const filtrados = useMemo(() => {
        return agendamentos.filter((ag) => {
            const dt = new Date(ag.dataHora);

            if (filters.dataInicio) {
                const di = parseDate(filters.dataInicio);
                if (!sameOrAfter(dt, di)) return false;
            }

            if (filters.dataFim) {
                const df = parseDate(filters.dataFim + "T23:59:59");
                if (!sameOrBefore(dt, df)) return false;
            }

            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(ag.status)) return false;
            }

            if (filters.clienteId && ag.clienteId !== filters.clienteId) return false;
            if (filters.servicoId && ag.servicoId !== filters.servicoId) return false;

            return true;
        });
    }, [agendamentos, filters]);

    const receitaPorDiaSemana = useMemo(() => {
        type DiaKey = 0|1|2|3|4|5|6;
        const diasLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

        const acc: Record<DiaKey, {
            dia: string;
            totalReceita: number;
            atendimentos: number;
        }> = {
            0: { dia: "Domingo", totalReceita: 0, atendimentos: 0 },
            1: { dia: "Segunda", totalReceita: 0, atendimentos: 0 },
            2: { dia: "Terça", totalReceita: 0, atendimentos: 0 },
            3: { dia: "Quarta", totalReceita: 0, atendimentos: 0 },
            4: { dia: "Quinta", totalReceita: 0, atendimentos: 0 },
            5: { dia: "Sexta", totalReceita: 0, atendimentos: 0 },
            6: { dia: "Sábado", totalReceita: 0, atendimentos: 0 },
        };

        filtrados.forEach((ag) => {
            if (!ag.servico) return;

            if (ag.status === "CANCELADO") return;

            const dt = new Date(ag.dataHora);
            const diaSemana = dt.getDay() as DiaKey;
            const preco = ag.servico.preco ?? 0;

            acc[diaSemana].totalReceita += preco;
            acc[diaSemana].atendimentos += 1;
        });

        const result = (Object.keys(acc) as unknown as DiaKey[]).map((k) => {
            const dia = acc[k];
            const ticketMedio = dia.atendimentos > 0
                ? dia.totalReceita / dia.atendimentos
                : 0;

            return {
                dia: dia.dia,
                totalReceita: dia.totalReceita,
                atendimentos: dia.atendimentos,
                ticketMedio,
            };
        });

        const maiorReceita = Math.max(...result.map(r => r.totalReceita), 0);

        return {
            porDia: result,       
            diaCampeao: result.reduce(
                (best, cur) => cur.totalReceita > best.totalReceita ? cur : best,
                { dia: "", totalReceita: 0, atendimentos: 0, ticketMedio: 0 }
            ),
            potencialMaximoDia: maiorReceita || 1, 
        };
    }, [filtrados]);

    const gaugePorDia = useMemo(() => {
        const max = receitaPorDiaSemana.potencialMaximoDia || 1;
        return receitaPorDiaSemana.porDia.map(d => ({
            dia: d.dia,
            ocupacaoPercent: (d.totalReceita / max) * 100, 
        }));
    }, [receitaPorDiaSemana]);

    const topClientes = useMemo(() => {
        interface ClienteStats {
            clienteId: string;
            nome: string;
            visitas: number;
            gastoTotal: number;
            ultimoAtendimento: string; 
        }

        const map = new Map<string, ClienteStats>();

        filtrados.forEach((ag) => {
            if (!ag.cliente) return;
            if (!ag.servico) return;
            if (ag.status === "CANCELADO") return;

            const id = ag.cliente.id!;
            const preco = ag.servico.preco ?? 0;
            const atual = map.get(id) ?? {
                clienteId: id,
                nome: ag.cliente.nome,
                visitas: 0,
                gastoTotal: 0,
                ultimoAtendimento: ag.dataHora,
            };

            atual.visitas += 1;
            atual.gastoTotal += preco;
            if (new Date(ag.dataHora) > new Date(atual.ultimoAtendimento)) {
                atual.ultimoAtendimento = ag.dataHora;
            }

            map.set(id, atual);
        });

        const lista = Array.from(map.values()).map(c => ({
            ...c,
            ticketMedio: c.visitas > 0 ? c.gastoTotal / c.visitas : 0,
        }));

        lista.sort((a, b) => b.gastoTotal - a.gastoTotal);

        return lista.map((c, idx) => ({
            ...c,
            posicao: idx + 1,
            badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null,
        }));
    }, [filtrados]);

    const frequenciaRetorno = useMemo(() => {
        const porCliente = new Map<string, Date[]>();

        filtrados
            .filter(ag => ag.cliente && ag.status !== "CANCELADO")
            .forEach((ag) => {
                const id = ag.clienteId;
                const lista = porCliente.get(id) ?? [];
                lista.push(new Date(ag.dataHora));
                porCliente.set(id, lista);
            });

        const diffsDias: number[] = [];

        porCliente.forEach((datas) => {
            datas.sort((a, b) => a.getTime() - b.getTime());
            for (let i = 1; i < datas.length; i++) {
                const d = diffDays(datas[i], datas[i - 1]);
                if (d > 0) diffsDias.push(d);
            }
        });

        const buckets = {
            semanal: 0,    
            quinzenal: 0,  
            mensal: 0,     
            trimestral: 0, 
            outros: 0,
        };

        diffsDias.forEach((d) => {
            if (d >= 7 && d <= 10) buckets.semanal++;
            else if (d >= 14 && d <= 17) buckets.quinzenal++;
            else if (d >= 28 && d <= 35) buckets.mensal++;
            else if (d >= 80 && d <= 100) buckets.trimestral++;
            else buckets.outros++;
        });

        const mediaDias = diffsDias.length
            ? diffsDias.reduce((a, b) => a + b, 0) / diffsDias.length
            : 0;

        return {
            diffsDias,    
            mediaDias,    
            buckets,       
        };
    }, [filtrados]);

    const lifetimeClientes = useMemo(() => {
        interface ClienteLife {
            clienteId: string;
            nome: string;
            primeira: Date;
            ultima: Date;
        }

        const map = new Map<string, ClienteLife>();

        filtrados
            .filter(ag => ag.cliente && ag.status !== "CANCELADO")
            .forEach((ag) => {
                const id = ag.clienteId;
                const dt = new Date(ag.dataHora);
                const atual = map.get(id) ?? {
                    clienteId: id,
                    nome: ag.cliente!.nome,
                    primeira: dt,
                    ultima: dt,
                };

                if (dt < atual.primeira) atual.primeira = dt;
                if (dt > atual.ultima) atual.ultima = dt;

                map.set(id, atual);
            });

        const hoje = new Date();
        const mesesPorCliente: number[] = [];

        map.forEach((c) => {
            const meses = diffMonths(c.ultima, c.primeira);
            mesesPorCliente.push(Math.max(meses, 0));
        });

        const totalClientes = mesesPorCliente.length || 1;

        const buckets = {
            novatos: 0,      
            emTeste: 0,      
            estabelecidos: 0,
            leais: 0,        
        };

        mesesPorCliente.forEach((m) => {
            if (m <= 3) buckets.novatos++;
            else if (m <= 6) buckets.emTeste++;
            else if (m <= 12) buckets.estabelecidos++;
            else buckets.leais++;
        });

        const tempoMedioMeses = mesesPorCliente.length
            ? mesesPorCliente.reduce((a, b) => a + b, 0) / mesesPorCliente.length
            : 0;

        return {
            mesesPorCliente,
            distribuicao: {
                novatosPercent: (buckets.novatos / totalClientes) * 100,
                emTestePercent: (buckets.emTeste / totalClientes) * 100,
                estabelecidosPercent: (buckets.estabelecidos / totalClientes) * 100,
                leaisPercent: (buckets.leais / totalClientes) * 100,
            },
            tempoMedioMeses,
        };
    }, [filtrados]);

    return {
        loading,
        error,
        recarregar: carregar,

        agendamentos: filtrados,

        receitaPorDiaSemana,
        gaugePorDia,        

        topClientes,        

        frequenciaRetorno,   

        lifetimeClientes,    
    };
}