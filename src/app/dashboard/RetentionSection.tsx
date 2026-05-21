"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { ReturnFrequencyCard } from "./ReturnFrequencyCard";
import { ClientLifecycleCard } from "./ClientLifecycleCard";

interface RetentionSectionProps {
    buckets: {
        semanal: number;
        quinzenal: number;
        mensal: number;
        trimestral: number;
        outros: number;
    };
    mediaDias: number;
    distribuicao: {
        novatosPercent: number;
        emTestePercent: number;
        estabelecidosPercent: number;
        leaisPercent: number;
    };
    counts: {
        novatos: number;
        emTeste: number;
        estabelecidos: number;
        leais: number;
    };
    tempoMedioMeses: number;
    loading: boolean;
}

export function RetentionSection(props: RetentionSectionProps) {
    return (
        <section className="space-y-4">
            <Separator className="my-2" />
            <div>
                <h2 className="text-lg font-semibold tracking-tight">Retenção de Clientes</h2>
                <p className="text-sm text-muted-foreground">Frequência de retorno e ciclo de vida</p>
            </div>
            <ReturnFrequencyCard
                buckets={props.buckets}
                mediaDias={props.mediaDias}
                loading={props.loading}
            />
            <ClientLifecycleCard
                distribuicao={props.distribuicao}
                counts={props.counts}
                tempoMedioMeses={props.tempoMedioMeses}
                loading={props.loading}
            />
        </section>
    );
}
