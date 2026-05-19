"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummaryCardsProps {
    receitaTotal: number;
    despesaTotal: number;
    saldo: number;
    loading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export function FinancialSummaryCards({ receitaTotal, despesaTotal, saldo, loading }: FinancialSummaryCardsProps) {
    if (loading) {
        return (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </section>
        );
    }

    return (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Income Card */}
            <Card className="border-l-4 border-emerald-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{formatCurrency(receitaTotal)}</div>
                    <p className="text-[12px] text-muted-foreground mt-1">Total de entradas</p>
                </CardContent>
            </Card>

            {/* Expense Card */}
            <Card className="border-l-4 border-red-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesa</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-xl font-bold">{formatCurrency(despesaTotal)}</div>
                    <p className="text-[12px] text-muted-foreground mt-1">Total de saídas</p>
                </CardContent>
            </Card>

            {/* Balance Card */}
            <Card className={`shadow-sm border-l-4 ${saldo >= 0 ? 'border-emerald-500' : 'border-red-500'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo</CardTitle>
                    <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className={`text-xl font-bold ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(saldo)}
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1">Receita - Despesas</p>
                </CardContent>
            </Card>
        </section>
    );
}
