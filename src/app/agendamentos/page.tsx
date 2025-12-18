"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { Plus, ChevronRight, CalendarDays } from "lucide-react";

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

// --- Hooks e Componentes Customizados ---
import { useAgendamento } from "@/hooks/useAgendamento";
import { AgendamentoFormDrawer } from "./AgendamentoFormDrawer";
import { AgendamentoComDetalhes } from "@/core/services/AgendamentoService"; // Ajuste o caminho se necessário
import { AgendamentoCard } from "./AgendamentoCard";
import { AgendamentoDetails } from "./AgendamentoDetail";
import { toast } from "sonner";

export type AgendamentoStatus = "CONCLUIDO" | "CONFIRMADO" | "CANCELADO";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ANOS = [2024, 2025, 2026, 2027];

export default function AgendaMensal() {

    // --- Estados ---
    const [dataAtual, setDataAtual] = useState<Date>(new Date());
    const [diaFocado, setDiaFocado] = useState<Date>(new Date());

    // Estados de UI (Drawers e Modais)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Estados de Seleção de Dados
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Data clicada para criar NOVO
    const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoComDetalhes | null>(null); // Para ver Detalhes
    const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<AgendamentoComDetalhes | null>(null); // Para o Form de Edição

    // Estado para forçar recarregamento da lista
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Cache de dados
    const [disponibilidadeMap, setDisponibilidadeMap] = useState<Record<string, boolean>>({});
    const [agendamentosMap, setAgendamentosMap] = useState<Record<string, AgendamentoComDetalhes[]>>({});

    // --- Hooks ---
    const { verificarDisponibilidade, agendamentos, remover } = useAgendamento();

    // Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const diasRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const isClickingRef = useRef(false);

    // --- Memos de Data ---
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
    const verificaQueryParamsNovo = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");
        if (action === "novo") {
            setIsDrawerOpen(true);
            setSelectedDate(dataAtual);

            // Limpar o parâmetro da URL para evitar reabertura
            urlParams.delete("action");
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [dataAtual]);

    useEffect(() => {
        const handleParamsChange = () => {
            verificaQueryParamsNovo();
        };

        handleParamsChange();

    }, [verificaQueryParamsNovo]);

    // 1. Carregar Agendamentos (Adicionado refreshTrigger na dependência)
    useEffect(() => {
        const controller = new AbortController();

        const carregarAgendamentos = async () => {
            try {
                const todos = await agendamentos();

                if (controller.signal.aborted) return;

                const mapa: Record<string, AgendamentoComDetalhes[]> = {};

                todos.forEach((ag: any) => {
                    if (!ag.dataHora) return;
                    const dataKey = ag.dataHora.split("T")[0];
                    if (!mapa[dataKey]) {
                        mapa[dataKey] = [];
                    }
                    mapa[dataKey].push(ag);
                });

                setAgendamentosMap(mapa);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Erro ao carregar agendamentos:", error);
                }
            }
        };

        carregarAgendamentos();

        return () => controller.abort();

    }, [mesControle, agendamentos, refreshTrigger]); // <--- refreshTrigger faz a mágica de recarregar

    // 2. Carregar Disponibilidade
    useEffect(() => {
        const controller = new AbortController();

        const carregarDisponibilidade = async () => {
            if (diasDoMes.length === 0) return;
            const novoMap: Record<string, boolean> = {};
            try {
                await Promise.all(diasDoMes.map(async (dia) => {
                    if (controller.signal.aborted) return;

                    const temVaga = await verificarDisponibilidade(dia);
                    const dateKey = dia.toISOString().split("T")[0];
                    novoMap[dateKey] = temVaga;
                }));

                if (!controller.signal.aborted) {
                    setDisponibilidadeMap(novoMap);
                }
            } catch (err) {
                console.error(err);
            }
        };

        carregarDisponibilidade();

        return () => controller.abort();
    }, [mesControle, refreshTrigger]); // Adicionado refreshTrigger aqui também

    // --- Observer (Scroll Spy) ---
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const hojeKey = format(new Date(), "yyyy-MM-dd");
            const elementoHoje = diasRefs.current[hojeKey];

            if (elementoHoje) {
                elementoHoje.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                setDiaFocado(new Date());
            } else {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                }
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [diasDoMes]);


    // --- Handlers ---

    const getAgendamentosDoDia = (dia: Date) => {
        const dateKey = dia.toISOString().split("T")[0];
        return (agendamentosMap[dateKey] || []).sort((a, b) => a.dataHora.localeCompare(b.dataHora));
    }

    // Ação: Criar Novo (Botão "+" ou "Disponível")
    const handleCreate = (dateStr: string) => {
        const date = new Date(dateStr);
        // Ajuste fuso horário simples para garantir que a data selecionada está correta
        // Ou use a string dateStr e converta dentro do componente se preferir

        setSelectedDate(date);
        setAgendamentoParaEditar(null); // Importante: Limpa edição anterior
        setIsDrawerOpen(true);
    }

    // Ação: Editar (Vindo do Detalhes)
    const handleEdit = (agendamento: AgendamentoComDetalhes) => {
        setAgendamentoParaEditar(agendamento);
        setSelectedDate(null); // Não é criação por data
        setIsDetailsOpen(false); // Fecha o detalhes
        setIsDrawerOpen(true); // Abre o formulário
    }

    // Ação: Sucesso no Formulário
    const handleFormSuccess = () => {
        setRefreshTrigger(prev => prev + 1); // Força recarregamento das listas
        // Toast já é chamado dentro do Drawer, mas pode adicionar outro aqui se quiser
    }

    // Ação: Deletar
    const handleDelete = async (id: string) => {
        toast.promise(remover(id), {
            loading: 'Removendo agendamento...',
            success: () => {
                setRefreshTrigger(prev => prev + 1);
                setIsDetailsOpen(false);
                return 'Agendamento removido com sucesso!';
            },
            error: 'Erro ao remover agendamento'
        });
    }

    const handleAnoChange = (anoStr: string) => setDataAtual((prev) => setYear(prev, parseInt(anoStr)));
    const handleMesChange = (mesIndexStr: string) => setDataAtual((prev) => setMonth(prev, parseInt(mesIndexStr)));

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
        const dateKey = inicioSemana.toISOString().split("T")[0];
        const el = diasRefs.current[dateKey];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { isClickingRef.current = false; }, 600);
    };

    const handleLongPressCard = (ag: any) => {
        setSelectedAgendamento(ag);
        setIsDetailsOpen(true);
    };

    const handleClickCard = (ag: any) => {
        console.log("Clicou no agendamento:", ag);
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
                        <Select value={getMonth(dataAtual).toString()} onValueChange={handleMesChange}>
                            <SelectTrigger className="w-full sm:w-[140px] bg-background border-input">
                                <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                                {MESES.map((mes, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>{mes}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={getYear(dataAtual).toString()} onValueChange={handleAnoChange}>
                            <SelectTrigger className="w-[100px] bg-background border-input">
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {ANOS.map((ano) => (
                                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant='default' onClick={() => handleCreate(new Date().toISOString().split("T")[0])}>
                            <Plus className="h-4 w-4" /> Novo
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR (Semana) - Código Mantido */}
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
                                        className={`py-4 w-full flex flex-col items-center justify-center border-b border-border transition-all ${isSelected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                                    >
                                        <span className="text-lg font-bold leading-none">{numeroSemana}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* LISTA DE DIAS */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth p-0 bg-background no-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-1 pb-10">
                        {diasDoMes.map((dia) => {
                            const agendamentosDoDia = getAgendamentosDoDia(dia);
                            const diaFormatado = format(dia, "eeee", { locale: ptBR });
                            const diaNumero = format(dia, "d");
                            const dateKey = dia.toISOString().split("T")[0];

                            return (
                                <div key={dateKey} data-date={dateKey} ref={(el) => { diasRefs.current[dateKey] = el; }} className="flex flex-col mb-10">
                                    <div className="flex items-baseline gap-2 mb-2 sticky top-0 glass p-2 px-4 z-10 border-b border-border">
                                        <span className="text-xl font-bold capitalize text-foreground">{diaFormatado.split("-")[0]}</span>
                                        <span className="text-md text-muted-foreground">- dia {diaNumero}</span>
                                    </div>

                                    <div className="space-y-3 p-2 px-4">
                                        {agendamentosDoDia.map((ag: any) => (
                                            <AgendamentoCard
                                                key={ag.id}
                                                agendamento={ag}
                                                getStatusColor={getStatusColor}
                                                onLongPress={handleLongPressCard}
                                                onClick={handleClickCard}
                                            />
                                        ))}

                                        {/* Botão Novo/Disponível */}
                                        <Button
                                            variant="link"
                                            onClick={() => handleCreate(dateKey)}
                                            className="hover:no-underline w-full h-14 border-3 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-sm hover:border-primary/50 hover:text-primary hover:font-semibold hover:bg-primary/5 transition-colors cursor-pointer group"
                                        >
                                            <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                            {disponibilidadeMap[dateKey] ? "Novo" : "Indisponível (Adicionar Extra)"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="pt-2 pb-6 px-4 flex justify-center">
                            <Button variant="outline" size="lg" onClick={handleNextMonth} className="w-full max-w-md">
                                Ir para {format(addMonths(dataAtual, 1), "MMMM", { locale: ptBR })} <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DRAWERS --- */}

            {/* 1. Drawer de Formulário (Criação e Edição) */}
            <AgendamentoFormDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                selectedDate={selectedDate}         // Passamos a data clicada (modo criar)
                agendamento={agendamentoParaEditar} // Passamos o agendamento (modo editar)
                onSuccess={handleFormSuccess}       // Callback para atualizar a lista
            />

            {/* 2. Drawer de Detalhes */}
            <AgendamentoDetails
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                agendamento={selectedAgendamento}
                onEdit={handleEdit}     // Conectado à função de abrir o form
                onDelete={handleDelete} // Conectado à função de deletar
            />
        </div>
    );
}