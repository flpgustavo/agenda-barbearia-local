'use client'

import { Button } from "@/components/ui/button";

import { Transacao } from "@/core/models/Transacao";
import { useTransacao } from "@/hooks/useTransacao";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { TransacaoFormDrawer } from "./TransacaoFormDrawer";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Transacoes() {

    const { items, remover, recarregar } = useTransacao()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);

    const handleSuccess = () => {
        setIsDrawerOpen(false);
        recarregar?.();
    }

    const handleForm = (Transacao?: Transacao) => {
        setSelectedTransacao(Transacao || null);
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

            <div className="w-full overflow-auto">
                <Table>
                    <TableCaption>Suas transações</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((transacao) => (
                            <TableRow key={transacao.id}>
                                <TableCell>{transacao.observacoes || 'Sem descrição'}</TableCell>
                                <TableCell>{transacao.status}</TableCell>
                                <TableCell>{transacao.tipo}</TableCell>
                                <TableCell className="text-right">{transacao.valor}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell className="text-right">R$ {items.reduce((acc, item) => acc + item.valor, 0).toFixed(2)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
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
            />

        </div>
    );
}