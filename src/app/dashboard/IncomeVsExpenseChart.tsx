"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface IncomeVsExpenseChartProps {
    receitaTotal: number;
    despesaTotal: number;
    loading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-popover text-popover-foreground border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-medium mb-1">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} style={{ color: entry.color }}>
                    {entry.name}: {formatCurrency(entry.value)}
                </p>
            ))}
        </div>
    );
}

export function IncomeVsExpenseChart({ receitaTotal, despesaTotal, loading }: IncomeVsExpenseChartProps) {
    const chartData = [
        { name: "Entrada", valor: receitaTotal, fill: "#22c55e" },
        { name: "Saída", valor: despesaTotal, fill: "#ef4444" },
    ];

    const hasData = receitaTotal > 0 || despesaTotal > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Receita vs Despesa</CardTitle>
                <CardDescription>Comparativo do período</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : !hasData ? (
                    <p className="text-sm text-muted-foreground text-center py-16">Nenhum dado no período</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                axisLine={{ stroke: "var(--border)" }}
                                tickLine={{ stroke: "var(--border)" }}
                            />
                            <YAxis
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                axisLine={{ stroke: "var(--border)" }}
                                tickLine={{ stroke: "var(--border)" }}
                                tickFormatter={(v) => `R$${v}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={60}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
