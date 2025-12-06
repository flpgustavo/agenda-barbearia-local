"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachWeekOfInterval,
    getISOWeek,
    isSameDay,
    isSameWeek,
    eachDayOfInterval,
    addMonths,
    setMonth,
    setYear,
    getYear,
    getMonth,
    startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, ChevronRight, CalendarDays, Clock } from "lucide-react";

// --- Componentes Shadcn ---
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAgendamento } from "@/hooks/useAgendamento";
import { CreateDrawer } from "./CreateDrawer";

// --- Tipos ---
interface BaseModel {
    id: string;
}

export type AgendamentoStatus = "CONCLUIDO" | "CONFIRMADO" | "CANCELADO";

export interface Agendamento extends BaseModel {
    clienteId: string;
    dataHora: string;
    servicosId: string[];
    status: AgendamentoStatus;
    observacoes?: string;
    nomeClienteMock?: string;
    nomeServicoMock?: string;
}

// --- Mock Data (Simples) ---
const MOCK_AGENDAMENTOS: Agendamento[] = [
    {
        id: "1",
        clienteId: "c1",
        dataHora: new Date(2025, 11, 20, 14, 0).toISOString(),
        servicosId: ["s1"],
        status: "CONFIRMADO",
        nomeClienteMock: "João Silva",
        nomeServicoMock: "Corte Masc.",
    },
    {
        id: "2",
        clienteId: "c2",
        dataHora: new Date(2025, 11, 21, 9, 311).toISOString(),
        servicosId: ["s2"],
        status: "CONCLUIDO",
        nomeClienteMock: "Maria Souza",
        nomeServicoMock: "Manicure",
    },
    {
        id: "3",
        clienteId: "c3",
        dataHora: new Date(2025, 11, 21, 10, 30).toISOString(),
        servicosId: ["s2"],
        status: "CONCLUIDO",
        nomeClienteMock: "Maria Souza 2",
        nomeServicoMock: "Manicure",
    },
];

// --- Constantes ---
const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ANOS = [2024, 2025, 2026, 2027];

export default function AgendaMensal() {

    const [dataAtual, setDataAtual] = useState<Date>(new Date());

    const [diaFocado, setDiaFocado] = useState<Date>(new Date());

    const [disponibilidadeMap, setDisponibilidadeMap] = useState<Record<string, boolean>>({});

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { verificarDisponibilidade } = useAgendamento();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const diasRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const isClickingRef = useRef(false);

    const diasDoMes = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(dataAtual),
            end: endOfMonth(dataAtual),
        });
    }, [dataAtual]);

    const semanasDoMes = useMemo(() => {
        return eachWeekOfInterval({
            start: startOfMonth(dataAtual),
            end: endOfMonth(dataAtual),
        }, { weekStartsOn: 1 });
    }, [dataAtual]);

    useEffect(() => {
        const carregarDisponibilidade = async () => {
            const novoMap: Record<string, boolean> = {};
            await Promise.all(diasDoMes.map(async (dia) => {
                const temVaga = await verificarDisponibilidade(dia);
                const dateKey = dia.toISOString().split("T")[0];
                novoMap[dateKey] = temVaga;
            }));

            setDisponibilidadeMap(novoMap);
        };

        carregarDisponibilidade();
    }, [diasDoMes, verificarDisponibilidade]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isClickingRef.current) return;
                const visible = entries.find((e) => e.isIntersecting);
                if (visible?.target) {
                    const dateStr = visible.target.getAttribute("data-date");
                    if (dateStr) setDiaFocado(new Date(dateStr));
                }
            },
            { root: scrollContainerRef.current, threshold: 0.2, rootMargin: "-10% 0px -50% 0px" }
        );

        Object.values(diasRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [diasDoMes]);


    // --- Handlers ---

    const handleCreate = (date: string) => {
        setDataAtual(new Date(date + "T00:00:00"));
        setIsDrawerOpen(true);
    };

    const handleAnoChange = (anoStr: string) => {
        setDataAtual((prev) => setYear(prev, parseInt(anoStr)));
    };

    const handleMesChange = (mesIndexStr: string) => {
        setDataAtual((prev) => setMonth(prev, parseInt(mesIndexStr)));
    };

    const handleNextMonth = () => {
        const proximoMes = addMonths(dataAtual, 1);
        setDataAtual(proximoMes);
        // Resetar scroll para o topo ao mudar de mês
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSemanaClick = (inicioSemana: Date) => {
        isClickingRef.current = true;
        setDiaFocado(inicioSemana); // Feedback visual imediato

        // Encontrar o primeiro dia desta semana que pertence ao mês atual
        // (Caso a semana comece no mês anterior)
        const diaAlvo = isSameDay(startOfMonth(dataAtual), inicioSemana)
            ? inicioSemana
            : inicioSemana; // Simplificação: tenta ir para o inicio da semana

        // Buscar referência
        // Precisamos garantir que rolamos para um dia que existe na lista atual
        let diaParaRolar = diaAlvo;
        if (getMonth(diaAlvo) !== getMonth(dataAtual)) {
            // Se o inicio da semana é mês passado, rola para o dia 1 do mês atual
            diaParaRolar = startOfMonth(dataAtual);
        }

        const dateKey = diaParaRolar.toISOString().split("T")[0];
        const el = diasRefs.current[dateKey]; // Tenta achar o elemento exato

        // Fallback: se não achar o dia exato (ex: semana começa dia 29/Jan e estamos em Fev), pega o primeiro dia da lista
        const targetEl = el || diasRefs.current[diasDoMes[0].toISOString().split("T")[0]];

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        setTimeout(() => { isClickingRef.current = false; }, 600);
    };

    const getAgendamentosDoDia = (dia: Date) => {
        return MOCK_AGENDAMENTOS.filter((ag) => isSameDay(new Date(ag.dataHora), dia));
    };

    // Cores dinâmicas para status
    const getStatusColor = (status: AgendamentoStatus) => {
        switch (status) {
            case "CONFIRMADO": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
            case "CONCLUIDO": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20";
            case "CANCELADO": return "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

            {/* --- HEADER --- */}
            <div className="bg-card border-b border-border p-4 shadow-sm z-20">
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                    <div className="sm:flex items-center gap-2 text-muted-foreground hidden">
                        <CalendarDays className="w-5 h-5" />
                        <span className="font-semibold text-foreground">Agendamentos</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={getMonth(dataAtual).toString()}
                            onValueChange={handleMesChange}
                        >
                            <SelectTrigger className="w-full sm:w-[140px] bg-background border-input">
                                <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                                {MESES.map((mes, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>{mes}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={getYear(dataAtual).toString()}
                            onValueChange={handleAnoChange}
                        >
                            <SelectTrigger className="w-[100px] bg-background border-input">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {ANOS.map((ano) => (
                                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant='default'
                        >
                            <Plus className="h-4 w-4" />
                            Novo
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR */}
                <div className="w-18 sm:w-24 bg-card border-r border-border flex flex-col z-10">
                    <div className="py-2 text-center border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Semana
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col">
                            {semanasDoMes.map((inicioSemana) => {
                                const numeroSemana = getISOWeek(inicioSemana);
                                const isSelected = isSameWeek(inicioSemana, diaFocado, { weekStartsOn: 1 });

                                return (
                                    <button
                                        key={inicioSemana.toISOString()}
                                        onClick={() => handleSemanaClick(inicioSemana)}
                                        className={`
                      py-4 w-full flex flex-col items-center justify-center border-b border-border transition-all
                      ${isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                    `}
                                    >
                                        <span className="text-lg font-bold leading-none">{numeroSemana}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* LISTA DE DIAS */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto scroll-smooth p-0 bg-background no-scrollbar"
                >
                    <div className="max-w-3xl mx-auto space-y-1 pb-10">

                        {diasDoMes.map((dia) => {
                            const agendamentos = getAgendamentosDoDia(dia);
                            const diaFormatado = format(dia, "eeee", { locale: ptBR });
                            const diaNumero = format(dia, "d");
                            const dateKey = dia.toISOString().split("T")[0];

                            return (
                                <div
                                    key={dateKey}
                                    data-date={dateKey}
                                    ref={(el) => { diasRefs.current[dateKey] = el; }}
                                    className="flex flex-col mb-10"
                                >
                                    {/* Cabeçalho do Dia */}
                                    <div className="flex items-baseline gap-2 mb-2 sticky top-0 glass p-2 px-4 z-10 border-b border-border">
                                        <span className="text-xl font-bold capitalize text-foreground">
                                            {diaFormatado.split("-")[0]}
                                        </span>
                                        <span className="text-md text-muted-foreground">- dia {diaNumero}</span>
                                    </div>

                                    {/* Agendamentos */}
                                    <div className="space-y-3 p-2 px-4">
                                        {agendamentos.length > 0 ? (
                                            <>
                                                {agendamentos.map((ag) => (
                                                    <Card key={ag.id} className={`border ${getStatusColor(ag.status)} shadow-sm transition-all hover:shadow-md py-2 cursor-pointer`}>
                                                        <CardContent className="p-3 flex justify-between items-center">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-lg">
                                                                    <span className="flex flex-row items-center gap-1">
                                                                        <Clock size={14} /> {format(new Date(ag.dataHora), "HH:mm")}
                                                                    </span>
                                                                </span>
                                                                <span className="font-medium text-foreground">{ag.nomeClienteMock}</span>
                                                                <span className="text-sm opacity-90 font-medium">{ag.nomeServicoMock}</span>
                                                            </div>

                                                            <div className="text-[10px] font-bold uppercase tracking-wide opacity-70 border border-current px-2 py-0.5 rounded-full">
                                                                {ag.status}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {disponibilidadeMap[dateKey] && (
                                                    <Button
                                                        variant="link"
                                                        onClick={() => handleCreate(dateKey)}
                                                        className="hover:no-underline w-full h-14 border-3 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-sm hover:border-primary/50 hover:text-primary hover:font-semibold hover:bg-primary/5 transition-colors cursor-pointer group">
                                                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                        Novo
                                                    </Button>
                                                )
                                                }
                                            </>
                                        ) : (
                                            <Button
                                                variant="link"
                                                onClick={() => handleCreate(dateKey)}
                                                className="hover:no-underline w-full h-14 border-3 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-sm hover:border-primary/50 hover:text-primary hover:font-semibold hover:bg-primary/5 transition-colors cursor-pointer group">
                                                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                Disponível
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2 pb-6 px-4 flex justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleNextMonth}
                                className="w-full max-w-md"
                            >
                                Ir para {format(addMonths(dataAtual, 1), "MMMM", { locale: ptBR })}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                    </div>
                </div>
            </div>

            <CreateDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                data={dataAtual}
            />
        </div>
    );
}