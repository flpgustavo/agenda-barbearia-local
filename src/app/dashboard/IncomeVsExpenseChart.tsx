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
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                            <YAxis className="text-xs text-muted-foreground" tickFormatter={(v) => `R$${v}`} />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
