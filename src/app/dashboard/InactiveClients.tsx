"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InactiveClientsProps {
    ultimaVisitaPorCliente: Record<string, { nome: string; ultimaData: string }>;
    loading: boolean;
}

export function InactiveClients({ ultimaVisitaPorCliente, loading }: InactiveClientsProps) {
    const [threshold, setThreshold] = useState(30);

    const clientesInativos = useMemo(() => {
        const hoje = new Date();
        const entries = Object.entries(ultimaVisitaPorCliente)
            .map(([id, data]) => {
                const ultima = new Date(data.ultimaData);
                const diff = Math.round((hoje.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24));
                return { clienteId: id, nome: data.nome, diasSemVisita: diff };
            })
            .filter((c) => c.diasSemVisita > threshold)
            .sort((a, b) => b.diasSemVisita - a.diasSemVisita);
        return entries;
    }, [ultimaVisitaPorCliente, threshold]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Clientes Inativos</CardTitle>
                <div className="flex items-center gap-1 mt-2">
                    {[30, 60, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setThreshold(d)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                threshold === d
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {d} dias
                        </button>
                    ))}
                </div>
                <CardDescription>Sem visitas há mais de {threshold} dias</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : clientesInativos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        {Object.keys(ultimaVisitaPorCliente).length > 0
                            ? `Todos os clientes visitaram nos últimos ${threshold} dias.`
                            : "Nenhum dado de cliente disponível."}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {clientesInativos.map((c) => (
                            <div key={c.clienteId} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                <p className="text-sm font-medium">{c.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                    {c.diasSemVisita} dia{c.diasSemVisita !== 1 ? "s" : ""} sem visita
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
