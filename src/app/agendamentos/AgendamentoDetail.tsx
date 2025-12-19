"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    User,
    Scissors,
    MessageCircle,
    Pencil,
    Trash2,
    X
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Defina a interface ou importe do seu serviço
interface AgendamentoDetailsProps {
    agendamento: any; // Pode trocar 'any' pelo tipo AgendamentoComDetalhes se tiver importado
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (ag: any) => void;
    onDelete: (id: string) => void;
}

export function AgendamentoDetails({
    agendamento,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: AgendamentoDetailsProps) {
    // Se não houver agendamento selecionado, não renderiza nada
    if (!agendamento) return null;

    // Formatação de Data e Hora
    const horaVisual = format(new Date(agendamento.dataHora), "HH:mm");
    const dataObj = new Date(agendamento.dataHora);
    const dataExtenso = format(dataObj, "EEEE, dd 'de' MMMM", { locale: ptBR });

    // Preparar WhatsApp
    const telefoneLimpo = agendamento.cliente.telefone?.replace(/\D/g, "") || "";
    const whatsappLink = `https://wa.me/55${telefoneLimpo}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card w-[95%] rounded-xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Detalhes</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">

                    {/* INFO BLOCKS */}
                    <div className="grid gap-4">
                        {/* Data */}
                        <div className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30">
                            <div className="p-2 bg-card dark:bg-background rounded-md shadow-md">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Data e Hora</p>
                                <p className="font-semibold text-sm text-foreground">
                                    Agendado para <u>{dataExtenso}</u> às {horaVisual} horas
                                </p>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                            <div className="p-2 bg-card dark:bg-background rounded-md shadow-sm">
                                <User className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                <p className="font-semibold text-foreground">
                                    {agendamento.cliente?.nome || "Nome não encontrado"}
                                </p>
                                <p className="font-semibold text-xs text-foreground">
                                    {agendamento.cliente?.telefone || "Telefone não encontrado"}
                                </p>
                            </div>
                        </div>

                        {/* Serviço */}
                        <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                            <div className="p-2 bg-card dark:bg-background rounded-md shadow-sm">
                                <Scissors className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Serviço</p>
                                <p className="font-semibold text-foreground">
                                    {agendamento.servico?.nome || "Serviço não encontrado"} - {agendamento.servico?.duracaoMinutos || 0} minutos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-1 gap-2 mt-2">

                    {telefoneLimpo && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            onClick={() => window.open(whatsappLink, "_blank")}
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chamar no WhatsApp
                        </Button>
                    )}

                    <div className="flex w-full gap-2">
                        <Button
                            variant="destructive"
                            className="flex-1 hover:bg-red-600 hover:text-white"
                            onClick={() => {
                                if (confirm("Tem certeza que deseja apagar?")) {
                                    onDelete(agendamento.id);
                                    onOpenChange(false);
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Apagar
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                            onClick={() => {
                                onOpenChange(false);
                                onEdit(agendamento);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}