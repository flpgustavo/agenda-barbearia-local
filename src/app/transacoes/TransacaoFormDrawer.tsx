"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { useTransacao } from "@/hooks/useTransacao";
import { Transacao, TransacaoStatus } from "@/core/models/Transacao";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AgendamentoComDetalhes } from "@/core/services/AgendamentoService";

interface TransacaoFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    Transacao?: Transacao;
    agendamento?: AgendamentoComDetalhes;
    onSuccess?: (transacao: Transacao) => void;
}

export function TransacaoFormDrawer({
    open,
    onOpenChange,
    Transacao,
    agendamento,
    onSuccess,
}: TransacaoFormDrawerProps) {

    const { criar, atualizar } = useTransacao();

    // Estados do Formulário
    const [id, setId] = useState("");
    const [dataHora, setDataHora] = useState("");
    const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
    const [status, setStatus] = useState<TransacaoStatus>("AGENDADO");
    const [valor, setValor] = useState<string>("");
    const [observacoes, setObservacoes] = useState("");

    const [loading, setLoading] = useState(false);

    // Reset e Carga de Dados
    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setId("");
                setDataHora(new Date().toISOString().slice(0, 16));
                setTipo("ENTRADA");
                setStatus("AGENDADO");
                setValor("");
                setObservacoes("");
            }, 300);
            return () => clearTimeout(timeout);
        }

        if (Transacao) {
            setId(Transacao.id || "");
            setDataHora(Transacao.dataHora ? new Date(Transacao.dataHora).toISOString().slice(0, 16) : "");
            setTipo(Transacao.tipo || "ENTRADA");
            setStatus(Transacao.status || "AGENDADO");
            setValor(Transacao.valor ? String(Transacao.valor) : "");
            setObservacoes(Transacao.observacoes || "");
        } else {
            setDataHora(new Date().toISOString().slice(0, 16));
        }

        if (agendamento) {
            setStatus("AGENDADO");
            setTipo("ENTRADA");
            setValor(String(agendamento?.servico?.preco));
            setObservacoes('Agendamento de ' + agendamento?.servico?.nome + ' para ' + agendamento?.cliente?.nome);
        }

    }, [open, Transacao]);

    const handleSave = async () => {
        if (!dataHora || !valor) {
            toast.warning("Por favor, preencha a data e o valor.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                dataHora,
                tipo,
                status,
                valor: parseFloat(valor.replace(",", ".")),
                observacoes,
                // Lógica do AgendamentoId:
                // Se estiver editando e já existir no objeto, mantém.
                // Se for novo e vier por prop, usa a prop.
                // Se não vier nada, envia undefined (oculto/opcional).
                agendamentoId: Transacao?.agendamentoId || agendamento?.id || undefined
            };

            let result;
            if (!id) {
                result = await criar(payload);
            } else {
                result = await atualizar(id, payload);
            }

            toast.success(`Transação ${!id ? "criada" : "atualizada"} com sucesso!`);
            onSuccess?.(payload as Transacao);
            onOpenChange(false);

            return result;
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
            toast.error(error instanceof Error ? error.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-card">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{!id ? "Nova" : "Editar"} Transação</DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">

                        <div className="flex flex-col">
                            <div>
                                <Label
                                    className="mb-2"
                                >
                                    Data e Hora *
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={dataHora}
                                    onClick={(e) => e.currentTarget.showPicker()}
                                    onChange={(e) => setDataHora(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Tipo *</Label>
                            <RadioGroup
                                value={tipo}
                                onValueChange={(v) => setTipo(v as 'ENTRADA' | 'SAIDA')}
                                className="grid grid-cols-2 gap-2"
                            >
                                <Label
                                    htmlFor="ENTRADA"
                                    className={cn(
                                        "flex items-center justify-center gap-4 p-2 rounded-lg border-2 cursor-pointer transition-all bg-emerald-500/10 hover:border-emerald-500 dark:hover:bg-emerald/20",
                                        tipo === "ENTRADA" ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/20 font-bold" : "border-muted"
                                    )}
                                >
                                    <RadioGroupItem value="ENTRADA" id="ENTRADA" className="sr-only" />
                                    <div className="space-y-1">
                                        <p className="text-sm tracking-wider">Entrada</p>
                                    </div>
                                </Label>
                                <Label
                                    htmlFor="SAIDA"
                                    className={cn(
                                        "flex items-center justify-center gap-4 p-2 rounded-lg border-2 cursor-pointer transition-all bg-red-500/10 hover:border-red-500 dark:hover:bg-red/20",
                                        tipo === "SAIDA" ? "border-red-500 bg-red-500/5 dark:bg-red-500/20 font-bold" : "border-muted"
                                    )}
                                >
                                    <RadioGroupItem value="SAIDA" id="SAIDA" className="sr-only" />
                                    <div className="space-y-1">
                                        <p className=" text-sm tracking-wider">Saída</p>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2 grid grid-cols-2 gap-2">
                            <div>
                                <Label
                                    className="mb-2"
                                >
                                    Valor (R$) *
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label
                                    className="mb-2"
                                >
                                    Status
                                </Label>
                                <Select
                                    value={status}
                                    onValueChange={(val: TransacaoStatus) => setStatus(val)}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AGENDADO">Agendado</SelectItem>
                                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Observações</Label>
                            <Textarea
                                placeholder="Detalhes adicionais..."
                                value={observacoes}
                                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setObservacoes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}