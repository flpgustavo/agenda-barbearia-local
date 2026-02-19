"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

import { toast } from "sonner";
import { useServico } from "@/hooks/useServico";
import { Servico } from "@/core/models/Servico";
import { InputMask } from "@/components/ui/input-mask";

interface ServicoFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    servico?: Servico;
    onSuccess?: (servico: Servico) => void;

}

export function ServicoFormDrawer({ open, onOpenChange, servico, onSuccess }: ServicoFormDrawerProps) {
    // Estados do Formulário
    const { criar, atualizar } = useServico();
    const [nome, setNome] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState(0);
    const [preco, setPreco] = useState(0);
    const [precoDisplay, setPrecoDisplay] = useState("");
    const [id, setId] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setNome("");
                setDuracaoMinutos(0);
                setPreco(0);
                setPrecoDisplay("");
            }, 300);

            return () => clearTimeout(timeout);
        }

        if (servico) {
            setNome(servico.nome);
            setDuracaoMinutos(servico.duracaoMinutos || 0);
            setPreco(servico.preco || 0);
            setPrecoDisplay(servico.preco ? servico.preco.toString().replace('.', ',') : "");
            setId(servico.id || "");
        }

    }, [open, servico]);

    const handleSave = async () => {
        if (!nome || !duracaoMinutos || !preco) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        if (nome.length < 3) {
            toast.error("O nome deve ter pelo menos 3 caracteres.");
            return;
        }

        if (duracaoMinutos <= 0) {
            toast.error("A duração deve ser maior que 0.");
            return;
        }

        if (preco <= 0) {
            toast.error("O preço deve ser maior que 0.");
            return;
        }

        setLoading(true);
        try {
            let result;
            if (!id) {
                result = await criar({ nome: nome, duracaoMinutos: duracaoMinutos, preco: preco });
            } else {
                result = await atualizar(id, { nome: nome, duracaoMinutos: duracaoMinutos, preco: preco });
            }

            const novo = {
                id: id || result,
                nome,
                duracaoMinutos,
                preco
            };

            toast.success(`Serviço ${!id ? "criado" : "atualizado"} com sucesso!`);
            onOpenChange(false);
            setDuracaoMinutos(0);
            setPreco(0);
            setPrecoDisplay("");
            onSuccess?.(novo as Servico);
            return result;
        } catch (error) {
            console.error("Erro ao criar serviço:", error);
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
                        <DrawerTitle>{!id ? "Novo" : "Editar"} Serviço</DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Nome *</Label>
                            <Input
                                type="text"
                                placeholder="Nome do serviço"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2 flex flex-col">
                                <Label>Duração *</Label>
                                <Input
                                    type="number"
                                    placeholder="Duração em minutos"
                                    value={duracaoMinutos || ""}
                                    onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2 flex flex-col">
                                <Label>Preço *</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={precoDisplay}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.replace(/[^0-9,-]/g, '');
                                        const parts = value.split(',');
                                        if (parts.length > 2) {
                                            value = parts[0] + ',' + parts.slice(1).join('');
                                        }
                                        setPrecoDisplay(value);
                                        setPreco(Number(value.replace(',', '.')));
                                    }}
                                />
                            </div>
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