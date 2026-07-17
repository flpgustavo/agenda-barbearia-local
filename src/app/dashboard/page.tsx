"use client";

import React, { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import {
    RefreshCw,
    TrendingUp,
    Users,
    Clock,
    Wallet,
} from "lucide-react";

// Imports UI (Shadcn pattern)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Importe seu hook aqui
import { useDashboardAgendamentos, DashboardFilters } from "@/hooks/useDashboardAgendamentos";
import { DateRangeFilter } from "./DateRangeFilter";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { IncomeVsExpenseChart } from "./IncomeVsExpenseChart";
import { InsightsSection } from "./InsightsSection";
import { RetentionSection } from "./RetentionSection";

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export default function DashboardPage() {
    const [diaSelecionado, setDiaSelecionado] = useState(null);

    // Estado inicial dos filtros: Mês atual
    const [filters, setFilters] = useState<DashboardFilters>({
        dataInicio: startOfMonth(new Date()).toISOString().split("T")[0],
        dataFim: endOfMonth(new Date()).toISOString().split("T")[0],
    });

    const {
        loading,
        error,
        recarregar,
        receitaPorDiaSemana,
        topClientes,
        frequenciaRetorno,
        agendamentos,
        lifetimeClientes,
        receitaTotal,
        despesaTotal,
        saldo,
        servicosRanking,
        topServices12meses,
        topClientes12meses,
        ultimaVisitaPorCliente,
    } = useDashboardAgendamentos(filters);

    // Função simples para mudar datas
    const handleFilterChange = (inicio: string, fim: string) => {
        setFilters(prev => ({ ...prev, dataInicio: inicio, dataFim: fim }));
    };


    // Função para alternar a seleção
    const handleBarClick = (dia: any) => {
        setDiaSelecionado(prev => prev === dia ? null : dia);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => recarregar()}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-xs text-muted-foreground">Visão geral do negócio</p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-4">
                    <DateRangeFilter onFilterChange={handleFilterChange} />
                </div>
            </header>

            <main className="container mx-auto p-4 space-y-6">
                    {error && (
                        <div className="p-4 rounded bg-destructive/15 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* 1. KPI Cards (Resumo) */}
                    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <KPICard
                            title="Dia Campeão"
                            value={loading ? "..." : receitaPorDiaSemana.diaCampeao.dia}
                            subValue={loading ? "" : formatCurrency(receitaPorDiaSemana.diaCampeao.totalReceita)}
                            icon={<TrendingUp className="h-4 w-4 text-primary" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Ticket Médio"
                            value={loading ? "..." : formatCurrency(receitaPorDiaSemana.diaCampeao.ticketMedio)}
                            subValue="No melhor dia"
                            icon={<Wallet className="h-4 w-4 text-emerald-500" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Retorno Médio"
                            value={loading ? "..." : `${Math.round(frequenciaRetorno.mediaDias)} dias`}
                            subValue="Frequência"
                            icon={<Clock className="h-4 w-4 text-blue-500" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Agendamentos"
                            value={loading ? "..." : `${agendamentos.length}`}
                            subValue={"Total em aberto: " + agendamentos.filter(a => a.status === "CONFIRMADO").length}
                            icon={<Users className="h-4 w-4 text-primary" />}
                            loading={loading}
                        />
                    </section>

                    {/* Phase 5 — Métricas Financeiras */}
                    <section className="space-y-4">
                        <Separator className="my-2" />
                        <FinancialSummaryCards
                            receitaTotal={receitaTotal}
                            despesaTotal={despesaTotal}
                            saldo={saldo}
                            loading={loading}
                        />
                        <IncomeVsExpenseChart
                            receitaTotal={receitaTotal}
                            despesaTotal={despesaTotal}
                            loading={loading}
                        />
                    </section>

                    {/* 2. Receita Semanal (Gráfico de Barras CSS) */}
                    <Card onClick={() => setDiaSelecionado(null)}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Receita por Dia da Semana</CardTitle>
                            <CardDescription>Toque na barra para ver o valor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-40 w-full" />
                            ) : (
                                <div className="flex items-end justify-between gap-1 h-52 mt-6 px-1">
                                    {receitaPorDiaSemana.porDia.map((item) => {
                                        const percent = (item.totalReceita / (receitaPorDiaSemana.potencialMaximoDia || 1)) * 100;
                                        const isBest = item.dia === receitaPorDiaSemana.diaCampeao.dia;
                                        const isSelected = diaSelecionado === item.dia;
                                        const diaAbreviado = item.dia.substring(0, 3).toUpperCase();

                                        return (
                                            <div
                                                key={item.dia}
                                                className="flex flex-col items-center justify-end w-full relative h-full max-w-[45px] cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBarClick(item.dia);
                                                }}
                                            >
                                                <div className={`absolute -top-10 text-white dark:text-black bg-accent-foreground text-sm py-1 px-2 rounded shadow-lg transition-all duration-200 pointer-events-none ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                                    }`}>
                                                    {formatCurrency(item.totalReceita)}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent-foreground rotate-45"></div>
                                                </div>

                                                <div
                                                    className={`w-full rounded-t-sm transition-all duration-300 ${isSelected ? 'ring-1 ring-offset-1 ring-slate-400' : ''
                                                        } ${isBest ? 'bg-primary' : 'bg-primary/25'}`}
                                                    style={{ height: `${Math.max(percent, 4)}%` }}
                                                ></div>

                                                <span className={`text-[12px] mt-2 font-bold transition-colors ${isSelected || isBest ? 'text-primary' : 'text-muted-foreground'
                                                    }`}>
                                                    {diaAbreviado}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Phase 6 — Rankings & Insights */}
                    <InsightsSection
                        servicosRanking={servicosRanking}
                        topServices12meses={topServices12meses}
                        topClientes12meses={topClientes12meses}
                        ultimaVisitaPorCliente={ultimaVisitaPorCliente}
                        loading={loading}
                    />

                    {/* Phase 8 — Retenção de Clientes */}
                    {/* <RetentionSection
                        buckets={frequenciaRetorno.buckets}
                        mediaDias={frequenciaRetorno.mediaDias}
                        distribuicao={lifetimeClientes.distribuicao}
                        counts={lifetimeClientes.counts}
                        tempoMedioMeses={lifetimeClientes.tempoMedioMeses}
                        loading={loading}
                    /> */}
                </main>
        </div>
    );
}

// --- Subcomponentes para organização ---

function KPICard({ title, value, subValue, icon, loading }: { title: string, value: string | number, subValue: string, icon: React.ReactNode, loading: boolean }) {
    return (
        <Card className="flex flex-col justify-between shadow-sm py-3 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {loading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <>
                        <div className="text-xl font-bold truncate">{value}</div>
                        <p className="text-[12px] text-muted-foreground mt-1 truncate">
                            {subValue}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
