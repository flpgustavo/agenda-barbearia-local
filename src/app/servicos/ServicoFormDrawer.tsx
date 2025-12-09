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

interface ServicoFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    servico?: Servico;
}

export function ServicoFormDrawer({ open, onOpenChange, servico }: ServicoFormDrawerProps) {

    // Estados do Formulário
    const { criar, atualizar } = useServico();
    const [nome, setNome] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState(0);
    const [preco, setPreco] = useState(0);
    const [id, setId] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setNome("");
                setDuracaoMinutos(0);
                setPreco(0);
            }, 300);

            return () => clearTimeout(timeout);
        }

        if (servico) {
            setNome(servico.nome);
            setDuracaoMinutos(servico.duracaoMinutos || 0);
            setPreco(servico.preco || 0);
            setId(servico.id || "");
        }

    }, [open, servico]);

    const handleSave = async () => {
        if (!nome || !duracaoMinutos || !preco) {
            toast.error("Por favor, preencha todos os campos.");
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

            toast.success(`Serviço ${!id ? "criado" : "atualizado"} com sucesso!`);
            onOpenChange(false);
            setDuracaoMinutos(0);
            setPreco(0);
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
                                <Label>Duração (minutos) *</Label>
                                <Input
                                    type="number"
                                    placeholder="Duração em minutos"
                                    value={duracaoMinutos}
                                    onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2 flex flex-col">
                                <Label>Preço *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Preço do serviço"
                                    value={preco}
                                    onChange={(e) => setPreco(Number(e.target.value))}
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