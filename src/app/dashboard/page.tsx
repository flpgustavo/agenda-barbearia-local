"use client";

import React, { useState, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    RefreshCw,
    TrendingUp,
    Users,
    Clock,
    Wallet,
    Trophy,
    Filter
} from "lucide-react";

// Imports UI (Shadcn pattern)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Importe seu hook aqui
import { useDashboardAgendamentos, DashboardFilters } from "@/hooks/useDashboardAgendamentos";
import { DateRangeFilter } from "./DateRangeFilter";

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export default function DashboardPage() {
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
        lifetimeClientes,
    } = useDashboardAgendamentos(filters);

    // Função simples para mudar datas
    const handleFilterChange = (inicio: string, fim: string) => {
        setFilters(prev => ({ ...prev, dataInicio: inicio, dataFim: fim }));
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header Sticky */}
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
                            <p className="text-xs text-muted-foreground">
                                Visão geral do negócio
                            </p>
                        </div>
                    </div>

                </div>

                {/* Barra de Filtros Rápida */}
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
                        title="Tempo de Vida"
                        value={loading ? "..." : `${lifetimeClientes.tempoMedioMeses.toFixed(1)} meses`}
                        subValue="Retenção média"
                        icon={<Users className="h-4 w-4 text-orange-500" />}
                        loading={loading}
                    />
                </section>

                {/* 2. Receita Semanal (Gráfico de Barras CSS) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Receita por Dia da Semana</CardTitle>
                        <CardDescription>Performance financeira diária</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : (
                            <div className="flex items-end justify-between gap-2 h-48 mt-2">
                                {receitaPorDiaSemana.porDia.map((item) => {
                                    const percent = (item.totalReceita / (receitaPorDiaSemana.potencialMaximoDia || 1)) * 100;
                                    const isBest = item.dia === receitaPorDiaSemana.diaCampeao.dia;

                                    return (
                                        <div key={item.dia} className="flex flex-col items-center justify-end w-full group relative h-full">
                                            {/* Tooltip simples no hover/touch */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-popover text-popover-foreground text-[10px] p-1 rounded border shadow-sm transition-opacity whitespace-nowrap z-20">
                                                {formatCurrency(item.totalReceita)}
                                            </div>

                                            <div
                                                className={`w-full rounded-t-md transition-all duration-500 relative ${isBest ? 'bg-primary' : 'bg-primary/30'}`}
                                                style={{ height: `${percent || 2}%` }}
                                            ></div>
                                            <span className="text-[10px] text-muted-foreground mt-2 font-medium uppercase">{item.dia}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Top Clientes (Lista Rankeada) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Top Clientes</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                        <CardDescription>Quem mais investe no seu negócio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : (
                            topClientes.slice(0, 5).map((cliente) => (
                                <div key={cliente.clienteId} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-xs">
                                            {cliente.badge || cliente.posicao}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{cliente.nome}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {cliente.visitas} visitas • Última: {format(new Date(cliente.ultimoAtendimento), 'dd/MM')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-primary">{formatCurrency(cliente.gastoTotal)}</p>
                                        <p className="text-[10px] text-muted-foreground">Méd: {formatCurrency(cliente.ticketMedio)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {!loading && topClientes.length === 0 && (
                            <p className="text-sm text-center text-muted-foreground py-4">Nenhum dado encontrado.</p>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Métricas de Retenção (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Frequência de Retorno */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Ciclo de Retorno</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loading ? <Skeleton className="h-20" /> : (
                                <>
                                    <MetricRow label="Semanal (7-10 dias)" value={frequenciaRetorno.buckets.semanal} total={frequenciaRetorno.diffsDias.length} color="bg-green-500" />
                                    <MetricRow label="Quinzenal (14-17 dias)" value={frequenciaRetorno.buckets.quinzenal} total={frequenciaRetorno.diffsDias.length} color="bg-blue-500" />
                                    <MetricRow label="Mensal (28-35 dias)" value={frequenciaRetorno.buckets.mensal} total={frequenciaRetorno.diffsDias.length} color="bg-yellow-500" />
                                    <MetricRow label="Trimestral (+80 dias)" value={frequenciaRetorno.buckets.trimestral} total={frequenciaRetorno.diffsDias.length} color="bg-red-500" />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Fidelidade / Lifetime */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">Estágio dos Clientes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {loading ? <Skeleton className="h-20" /> : (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Novatos</span>
                                        <span>Leais (+1 ano)</span>
                                    </div>
                                    <div className="flex w-full h-4 rounded-full overflow-hidden">
                                        <div className="bg-blue-400 h-full" style={{ width: `${lifetimeClientes.distribuicao.novatosPercent}%` }} />
                                        <div className="bg-blue-500 h-full" style={{ width: `${lifetimeClientes.distribuicao.emTestePercent}%` }} />
                                        <div className="bg-blue-600 h-full" style={{ width: `${lifetimeClientes.distribuicao.estabelecidosPercent}%` }} />
                                        <div className="bg-purple-600 h-full" style={{ width: `${lifetimeClientes.distribuicao.leaisPercent}%` }} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Novatos ({Math.round(lifetimeClientes.distribuicao.novatosPercent)}%)</div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Em teste ({Math.round(lifetimeClientes.distribuicao.emTestePercent)}%)</div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Estabelecidos ({Math.round(lifetimeClientes.distribuicao.estabelecidosPercent)}%)</div>
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-600"></div> Leais ({Math.round(lifetimeClientes.distribuicao.leaisPercent)}%)</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
}

// --- Subcomponentes para organização ---

function KPICard({ title, value, subValue, icon, loading }: { title: string, value: string | number, subValue: string, icon: React.ReactNode, loading: boolean }) {
    return (
        <Card className="flex flex-col justify-between shadow-sm py-3 gap-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
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
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {subValue}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function MetricRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
    const percent = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{value}</span>
            </div>
            <Progress value={percent} className="h-2" />
        </div>
    );
}