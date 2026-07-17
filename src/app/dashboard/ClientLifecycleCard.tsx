"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientLifecycleCardProps {
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

const stageConfig = [
    { key: 'novatos' as const, label: 'Novatos (0–3 meses)', percentKey: 'novatosPercent' as const, wrapperClass: '[&_[data-slot=progress-indicator]]:bg-slate-400' },
    { key: 'emTeste' as const, label: 'Em Teste (3–6 meses)', percentKey: 'emTestePercent' as const, wrapperClass: '[&_[data-slot=progress-indicator]]:bg-blue-400' },
    { key: 'estabelecidos' as const, label: 'Estabelecidos (6–12 meses)', percentKey: 'estabelecidosPercent' as const, wrapperClass: '[&_[data-slot=progress-indicator]]:bg-blue-600' },
    { key: 'leais' as const, label: 'Leais (12+ meses)', percentKey: 'leaisPercent' as const, wrapperClass: '[&_[data-slot=progress-indicator]]:bg-amber-500' },
];

export function ClientLifecycleCard({ distribuicao, counts, tempoMedioMeses, loading }: ClientLifecycleCardProps) {
    const totalCount = Object.values(counts).reduce((acc, val) => acc + val, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ciclo de Vida do Cliente</CardTitle>
                <CardDescription>Tempo médio: {Math.round(tempoMedioMeses)} meses</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                ) : totalCount === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum dado no período</p>
                ) : (
                    <div className="space-y-4">
                        {stageConfig.map((stage) => {
                            const count = counts[stage.key];
                            const percent = distribuicao[stage.percentKey];
                            return (
                                <div key={stage.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{stage.label}</span>
                                        <span className="text-muted-foreground">
                                            {count} cliente(s) ({Math.round(percent)}%)
                                        </span>
                                    </div>
                                    <div className={stage.wrapperClass}>
                                        <Progress value={Math.round(percent)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
