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
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, ChevronRight, CalendarDays, Clock, Link, PhoneCallIcon, MessageCircle } from "lucide-react";

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
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";

// --- Hooks e Componentes Customizados ---
import { useAgendamento } from "@/hooks/useAgendamento";
import { CreateDrawer } from "./CreateDrawer";
// Ajuste o import conforme a localização real do seu tipo
import { AgendamentoComDetalhes } from "@/core/services/AgendamentoService";
import { AgendamentoCard } from "./AgendamentoCard";
import { AgendamentoDetails } from "./AgendamentoDetail";

export type AgendamentoStatus = "CONCLUIDO" | "CONFIRMADO" | "CANCELADO";

// --- Constantes ---
const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ANOS = [2024, 2025, 2026, 2027];

export default function AgendaMensal() {

    // --- Estados ---
    const [dataAtual, setDataAtual] = useState<Date>(new Date());
    const [diaFocado, setDiaFocado] = useState<Date>(new Date());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoComDetalhes | null>(null);

    // Estado para disponibilidade (Cache de dias livres: { "2025-01-01": true })
    const [disponibilidadeMap, setDisponibilidadeMap] = useState<Record<string, boolean>>({});

    // Estado para agendamentos (Cache organizado: { "2025-01-01": [AgendamentoA, AgendamentoB] })
    const [agendamentosMap, setAgendamentosMap] = useState<Record<string, AgendamentoComDetalhes[]>>({});

    // --- Hooks ---
    const { verificarDisponibilidade, agendamentos } = useAgendamento();

    // Refs para scroll e observação
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const diasRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const isClickingRef = useRef(false);

    // --- Memos de Data ---

    // Variável de controle: muda apenas se o Mês/Ano mudar. 
    // Impede re-renderizações pesadas durante o scroll.
    const mesControle = format(dataAtual, "yyyy-MM");

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


    // --- Effects (Carga de Dados) ---

    // 1. Carregar e Agrupar Agendamentos
    useEffect(() => {
        const carregarAgendamentos = async () => {
            try {
                // Busca todos (idealmente filtraria por dataInicio/Fim no backend)
                const todos = await agendamentos();

                const mapa: Record<string, AgendamentoComDetalhes[]> = {};

                // Organiza num objeto para acesso rápido O(1)
                todos.forEach((ag: any) => {
                    if (!ag.dataHora) return;

                    const dataKey = ag?.dataHora.split("T")[0]; // YYYY-MM-DD
                    if (!mapa[dataKey]) {
                        mapa[dataKey] = [];
                    }
                    mapa[dataKey].push(ag);
                });

                setAgendamentosMap(mapa);
            } catch (error) {
                console.error("Erro ao carregar agendamentos:", error);
            }
        };

        carregarAgendamentos();

        // Recarrega se mudar o mês ou se fechar o Drawer (novo agendamento criado)
    }, [mesControle, agendamentos, isDrawerOpen]);

    // 2. Carregar Disponibilidade dos Dias
    useEffect(() => {
        const carregarDisponibilidade = async () => {
            if (diasDoMes.length === 0) return;

            const novoMap: Record<string, boolean> = {};

            // Verifica todos os dias em paralelo
            await Promise.all(diasDoMes.map(async (dia) => {
                const temVaga = await verificarDisponibilidade(dia);
                const dateKey = dia.toISOString().split("T")[0];
                novoMap[dateKey] = temVaga;
            }));

            setDisponibilidadeMap(novoMap);
        };

        carregarDisponibilidade();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesControle]); // Só roda se o mês mudar! Ignora scroll.


    // --- Observer (Scroll Spy) ---
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


    // --- Helpers & Handlers ---

    // Busca síncrona do mapa (muito rápida)
    const getAgendamentosDoDia = (dia: Date) => {
        const dateKey = dia.toISOString().split("T")[0];
        return (agendamentosMap[dateKey] || []).sort((a, b) => a.dataHora.localeCompare(b.dataHora));
    }
    const handleCreate = (dateStr: string) => {
        // Ajuste fuso horário: cria data ao meio-dia para evitar problemas de dia anterior
        setDataAtual(new Date(dateStr + "T12:00:00"));
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
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSemanaClick = (inicioSemana: Date) => {
        isClickingRef.current = true;
        setDiaFocado(inicioSemana);

        const diaAlvo = isSameDay(startOfMonth(dataAtual), inicioSemana)
            ? inicioSemana
            : inicioSemana;

        let diaParaRolar = diaAlvo;
        if (getMonth(diaAlvo) !== getMonth(dataAtual)) {
            diaParaRolar = startOfMonth(dataAtual);
        }

        const dateKey = diaParaRolar.toISOString().split("T")[0];
        const el = diasRefs.current[dateKey];
        const targetEl = el || diasRefs.current[diasDoMes[0].toISOString().split("T")[0]];

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        setTimeout(() => { isClickingRef.current = false; }, 600);
    };

    const handleLongPressCard = (ag: any) => {
        setSelectedAgendamento(ag);
        setIsDetailsOpen(true);
    };

    const handleClickCard = (ag: any) => {
        console.log("Clique curto");
    };

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

                        <Button variant='default'
                            onClick={() => handleCreate(new Date().toISOString().split("T")[0])}
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
                            // Busca instantânea no mapa
                            const agendamentosDoDia = getAgendamentosDoDia(dia);

                            const diaFormatado = format(dia, "eeee", { locale: ptBR });
                            const diaNumero = format(dia, "d");
                            const dateKey = dia.toISOString().split("T")[0];

                            // Verifica disponibilidade no mapa
                            const temVaga = disponibilidadeMap[dateKey];

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
                                        {agendamentosDoDia.length > 0 ? (
                                            <>
                                                {agendamentosDoDia.map((ag: any) => (
                                                    <AgendamentoCard
                                                        key={ag.id}
                                                        agendamento={ag}
                                                        getStatusColor={getStatusColor}
                                                        onLongPress={handleLongPressCard}
                                                        onClick={handleClickCard}
                                                    />
                                                ))}
                                                {disponibilidadeMap[dateKey] && (
                                                    <Button
                                                        variant="link"
                                                        onClick={() => handleCreate(dateKey)}
                                                        className="hover:no-underline w-full h-14 border-3 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-sm hover:border-primary/50 hover:text-primary hover:font-semibold hover:bg-primary/5 transition-colors cursor-pointer group"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                        Novo
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <Button
                                                variant="link"
                                                onClick={() => handleCreate(dateKey)}
                                                className="hover:no-underline w-full h-14 border-3 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-sm hover:border-primary/50 hover:text-primary hover:font-semibold hover:bg-primary/5 transition-colors cursor-pointer group"
                                            >
                                                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                Disponível
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Botão Próximo Mês */}
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

            {/* O Drawer fica aqui, fora do loop e do scroll */}
            <CreateDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                data={dataAtual}
            />

            <AgendamentoDetails
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                agendamento={selectedAgendamento}
                onEdit={(ag) => {
                    // Lógica para abrir o Drawer de edição
                    // Exemplo: handleCreate(ag.dataHora.split("T")[0]);
                    console.log("Editar", ag);
                }}
                onDelete={async (id) => {
                    // Lógica para apagar
                    // Exemplo: await delete(id);
                    console.log("Apagar ID", id);
                }}
            />
        </div>
    );
}


