'use client'

import { Button } from "@/components/ui/button";

import { Transacao } from "@/core/models/Transacao";
import { useTransacao } from "@/hooks/useTransacao";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { TransacaoFormDrawer } from "./TransacaoFormDrawer";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgendamento } from "@/hooks/useAgendamento";

export default function Transacoes() {

    const { items, remover, recarregar } = useTransacao()
    const { getDetails, loading} = useAgendamento()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);

    const handleSuccess = () => {
        setIsDrawerOpen(false);
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
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((transacao) => (
                            <TableRow key={transacao.id}>
                                <TableCell>{transacao.observacoes || 'Sem descrição'}
                                    {transacao.agendamentoId &&
                                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            Agendamento
                                        </span>
                                    }
                                </TableCell>
                                <TableCell>
                                    <span className={`px-3 py-2 rounded-full text-xs font-bold
                                        ${transacao.status === 'AGENDADO' ? 'text-yellow-500 bg-yellow-500/10' : transacao.status === 'CANCELADO' ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
                                        {transacao.status}
                                    </span>
                                </TableCell>

                                <TableCell className={`text-right ${transacao.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {transacao.tipo === 'ENTRADA' ? '' : ' -'}{transacao.valor}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleForm(transacao)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
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
                onSuccess={handleSuccess}
            />

        </div>
    );
}