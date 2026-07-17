"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { ServiceRankings } from "./ServiceRankings";
import { TopServices12months } from "./TopServices12months";
import { TopClients12months } from "./TopClients12months";
import { InactiveClients } from "./InactiveClients";

interface ServiceRankingItem {
    servicoId: string;
    nome: string;
    quantidade: number;
    receita: number;
}

interface Cliente12mesesItem {
    clienteId: string;
    nome: string;
    visitas: number;
    gastoTotal: number;
}

interface InsightsSectionProps {
    servicosRanking: {
        porQuantidade: ServiceRankingItem[];
        porReceita: ServiceRankingItem[];
    };
    topServices12meses: {
        porQuantidade: ServiceRankingItem[];
        porReceita: ServiceRankingItem[];
    };
    topClientes12meses: Cliente12mesesItem[];
    ultimaVisitaPorCliente: Record<string, { nome: string; ultimaData: string }>;
    loading: boolean;
}

export function InsightsSection({
    servicosRanking,
    topServices12meses,
    topClientes12meses,
    ultimaVisitaPorCliente,
    loading,
}: InsightsSectionProps) {
    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">Insights (12 meses)</h2>
                <p className="text-sm text-muted-foreground">
                    Desempenho de serviços e comportamento de clientes no último ano
                </p>
            </div>

            <ServiceRankings
                servicosRanking={servicosRanking}
                loading={loading}
            />
            <Separator />

            <TopServices12months
                topServices12meses={topServices12meses}
                loading={loading}
            />
            <Separator />

            <TopClients12months
                topClientes12meses={topClientes12meses}
                loading={loading}
            />
            <Separator />

            <InactiveClients
                ultimaVisitaPorCliente={ultimaVisitaPorCliente}
                loading={loading}
            />
        </section>
    );
}
