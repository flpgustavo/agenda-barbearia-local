'use client'

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Transacao, TransacaoStatus } from "@/core/models/Transacao"
import { Pencil, Trash2 } from "lucide-react"

interface TransacaoListItemProps {
    transacao: Transacao
    onClick?: (transacao: Transacao) => void
    onDelete?: (id: string) => void
    className?: string
}

function formatDate(dataHora: string | undefined): string {
    if (!dataHora) return ""
    return new Date(dataHora).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "long"
    })
}

function getStatusVariant(status: TransacaoStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "AGENDADO":
            return "outline"
        case "CONCLUIDO":
            return "default"
        case "CANCELADO":
            return "destructive"
        default:
            return "outline"
    }
}

function getStatusClass(status: TransacaoStatus): string {
    switch (status) {
        case "AGENDADO":
            return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-700"
        case "CONCLUIDO":
            return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-700"
        case "CANCELADO":
            return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-700"
        default:
            return ""
    }
}

export function TransacaoListItem({
    transacao,
    onClick,
    onDelete,
    className
}: TransacaoListItemProps) {
    const handleClick = () => {
        onClick?.(transacao)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete?.(transacao.id!)
    }

    return (
        <Card
            className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50 gap-2 py-3",
                className
            )}
            onClick={handleClick}
        >
            <CardContent className="flex flex-row items-center justify-between px-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-1 text-xs">
                            <Badge
                                variant={getStatusVariant(transacao.status)}
                                className={getStatusClass(transacao.status)}
                            >
                                {transacao.status}
                            </Badge>
                            {transacao.agendamentoId && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full">
                                    SERVIÇO
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-7"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                            {transacao.observacoes || "Sem descrição"}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 pb-0! px-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    {formatDate(transacao.dataHora)}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className={cn(
                        "text-base font-semibold",
                        transacao.tipo === "ENTRADA" ? "text-green-600" : "text-red-600"
                    )}>
                        R$ {transacao.tipo === "ENTRADA" ? "" : "-"}{transacao.valor.toFixed(2)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    )
}