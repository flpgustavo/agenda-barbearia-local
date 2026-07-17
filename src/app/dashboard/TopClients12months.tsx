"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Cliente12mesesItem {
    clienteId: string;
    nome: string;
    visitas: number;
    gastoTotal: number;
}

interface TopClients12monthsProps {
    topClientes12meses: Cliente12mesesItem[];
    loading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export function TopClients12months({ topClientes12meses, loading }: TopClients12monthsProps) {
    const temDados = topClientes12meses.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Clientes (12 meses)</CardTitle>
                <CardDescription>Maiores gastadores do último ano</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full mb-2" />)
                ) : !temDados ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum cliente nos últimos 12 meses.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {topClientes12meses.slice(0, 5).map((cliente, idx) => (
                            <div key={cliente.clienteId} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-xs">
                                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{cliente.nome}</p>
                                        <p className="text-xs text-muted-foreground">{cliente.visitas} visita(s)</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{formatCurrency(cliente.gastoTotal)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
