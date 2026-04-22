'use client'

import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/app/dashboard/DateRangeFilter";

import { Transacao } from "@/core/models/Transacao";
import { useTransacao } from "@/hooks/useTransacao";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { TransacaoFormDrawer } from "./TransacaoFormDrawer";
import { TransacaoList } from "@/components/transacoes/TransacaoList";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function Transacoes() {
    const { items, remover } = useTransacao()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);
    const [filterStart, setFilterStart] = useState(() => format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [filterEnd, setFilterEnd] = useState(() => format(endOfMonth(new Date()), "yyyy-MM-dd"));

    const dateRange = { start: filterStart, end: filterEnd };

    const handleFilterChange = (inicio: string, fim: string) => {
        setFilterStart(inicio);
        setFilterEnd(fim);
    };

    const handleSuccess = () => {
        setIsDrawerOpen(false);
    }

    const handleForm = (transacao?: Transacao) => {
        setSelectedTransacao(transacao || null);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await remover(id);
            toast.success(`Transação removida com sucesso!`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro desconhecido");
        }
    }

    return (
        <div className="min-h-screen bg-background pb-24 p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transações</h1>

                    <p className="text-muted-foreground">
                        Gerencie todas as suas transações financeiras.
                    </p>
                </div>
            </div>

            <div className="mb-4">
                <DateRangeFilter
                    onFilterChange={handleFilterChange}
                    className="max-w-md"
                />
            </div>

            <div className="w-full">
                <TransacaoList
                    items={items}
                    onEdit={handleForm}
                    onDelete={handleDelete}
                    dateRange={dateRange}
                />
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                    aria-label="Criar nova transação"
                    onClick={() => handleForm()}
                >
                    <Plus className="size-5 font-bold text-primary-foreground" />
                </Button>
            </div>

            <TransacaoFormDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                Transacao={selectedTransacao!}
                onSuccess={handleSuccess}
            />
        </div>
    );
}