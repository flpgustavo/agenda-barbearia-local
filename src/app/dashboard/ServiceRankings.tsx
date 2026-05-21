"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceRankingItem {
    servicoId: string;
    nome: string;
    quantidade: number;
    receita: number;
}

interface ServiceRankingsProps {
    servicosRanking: {
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

export function ServiceRankings({ servicosRanking, loading }: ServiceRankingsProps) {
    const temDados = servicosRanking.porQuantidade.length > 0 || servicosRanking.porReceita.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Serviços Mais Realizados</CardTitle>
                <CardDescription>Ranking do período filtrado</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : !temDados ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum serviço realizado no período.
                    </p>
                ) : (
                    <Tabs defaultValue="quantidade">
                        <TabsList className="w-full">
                            <TabsTrigger value="quantidade" className="flex-1">Por Quantidade</TabsTrigger>
                            <TabsTrigger value="receita" className="flex-1">Por Receita</TabsTrigger>
                        </TabsList>
                        <TabsContent value="quantidade" className="space-y-3 mt-4">
                            {servicosRanking.porQuantidade.map((item, idx) => (
                                <div key={item.servicoId} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-xs">
                                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1)}
                                        </div>
                                        <p className="text-sm font-medium">{item.nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{item.quantidade} agendamento(s)</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="receita" className="space-y-3 mt-4">
                            {servicosRanking.porReceita.map((item, idx) => (
                                <div key={item.servicoId} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted font-bold text-xs">
                                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1)}
                                        </div>
                                        <p className="text-sm font-medium">{item.nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{formatCurrency(item.receita)}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}
