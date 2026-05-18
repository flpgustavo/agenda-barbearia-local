'use client'

import { cn } from "@/lib/utils"
import { TransacaoListItem } from "./TransacaoListItem"
import { Transacao } from "@/core/models/Transacao"

interface TransacaoListProps {
    items: Transacao[]
    onEdit?: (transacao: Transacao) => void
    onDelete?: (id: string) => void
    className?: string
    dateRange?: { start: string; end: string }
}

export function TransacaoList({
    items,
    onEdit,
    onDelete,
    className,
    dateRange
}: TransacaoListProps) {
    const filteredItems = dateRange
        ? items.filter(t => {
            const transacaoDate = new Date(t.dataHora)
            const start = new Date(dateRange.start)
            const end = new Date(dateRange.end)
            return transacaoDate >= start && transacaoDate <= end
        })
        : items

    if (filteredItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="text-lg text-muted-foreground mb-2">
                    {dateRange ? "Nenhuma transação neste período" : "Nenhuma transação encontrada"}
                </p>
                <p className="text-sm text-muted-foreground">
                    {dateRange ? "Tente selecionar outro período" : "Toque no botão + para criar sua primeira transação"}
                </p>
            </div>
        )
    }

    const totalEntrada = filteredItems
        .filter(t => t.tipo === "ENTRADA" && t.status !== "CANCELADO")
        .reduce((acc, t) => acc + t.valor, 0)
    
    const totalSaida = filteredItems
        .filter(t => t.tipo === "SAIDA" && t.status !== "CANCELADO")
        .reduce((acc, t) => acc + t.valor, 0)

    const saldo = totalEntrada - totalSaida

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <div className="hidden md:grid md:grid-cols-4 gap-3 px-4 py-2 text-sm font-medium text-muted-foreground">
                <span>Data</span>
                <span>Descrição</span>
                <span>Situação</span>
                <span className="text-right">Valor</span>
            </div>
            
            <div className="flex flex-col gap-3">
                {filteredItems.map((transacao) => (
                    <TransacaoListItem
                        key={transacao.id}
                        transacao={transacao}
                        onClick={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Entradas:</span>
                    <span className="text-green-600 font-medium">R$ {totalEntrada.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total Saídas:</span>
                    <span className="text-red-600 font-medium">R$ {totalSaida.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                    <span className="font-medium">Saldo:</span>
                    <span className={cn(
                        "font-semibold",
                        saldo >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        R$ {saldo.toFixed(2).replace(".", ",")}
                    </span>
                </div>
            </div>
        </div>
    )
}