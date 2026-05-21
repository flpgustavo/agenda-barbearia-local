"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceRankingItem {
    servicoId: string;
    nome: string;
    quantidade: number;
    receita: number;
}

interface TopServices12monthsProps {
    topServices12meses: {
        porQuantidade: ServiceRankingItem[];
        porReceita: ServiceRankingItem[];
    };
    loading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export function TopServices12months({ topServices12meses, loading }: TopServices12monthsProps) {
    const items = topServices12meses.porReceita;
    const temDados = items.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Serviços (12 meses)</CardTitle>
                <CardDescription>Mais realizados no último ano</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : !temDados ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum serviço nos últimos 12 meses.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {items.slice(0, 5).map((item, idx) => (
                            <div key={item.servicoId} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-xs">
                                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.nome}</p>
                                        <p className="text-xs text-muted-foreground">{item.quantidade} agendamento(s)</p>
                                    </div>
                                </div>
                                <div className="text-sm font-bold">{formatCurrency(item.receita)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
