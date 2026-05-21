"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ReturnFrequencyCardProps {
    buckets: {
        semanal: number;
        quinzenal: number;
        mensal: number;
        trimestral: number;
        outros: number;
    };
    mediaDias: number;
    loading: boolean;
}

const bucketConfig = [
    { key: 'semanal' as const, label: 'Semanal', wrapperClass: '[&_[data-slot=progress-indicator]]:bg-blue-500' },
    { key: 'quinzenal' as const, label: 'Quinzenal', wrapperClass: '[&_[data-slot=progress-indicator]]:bg-cyan-500' },
    { key: 'mensal' as const, label: 'Mensal', wrapperClass: '[&_[data-slot=progress-indicator]]:bg-emerald-500' },
    { key: 'trimestral' as const, label: 'Trimestral', wrapperClass: '[&_[data-slot=progress-indicator]]:bg-amber-500' },
    { key: 'outros' as const, label: 'Outros', wrapperClass: '[&_[data-slot=progress-indicator]]:bg-slate-400' },
];

export function ReturnFrequencyCard({ buckets, mediaDias, loading }: ReturnFrequencyCardProps) {
    const total = Object.values(buckets).reduce((acc, val) => acc + val, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Frequência de Retorno</CardTitle>
                <CardDescription>Média: {Math.round(mediaDias)} dias</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-[200px] w-full" />
                ) : total === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum dado no período</p>
                ) : (
                    <div className="space-y-4">
                        {bucketConfig.map((bucket) => {
                            const value = buckets[bucket.key];
                            const percentage = (value / Math.max(total, 1)) * 100;
                            return (
                                <div key={bucket.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{bucket.label}</span>
                                        <span className="text-muted-foreground">
                                            {value} cliente(s) ({Math.round(percentage)}%)
                                        </span>
                                    </div>
                                    <div className={bucket.wrapperClass}>
                                        <Progress value={Math.round(percentage)} />
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
