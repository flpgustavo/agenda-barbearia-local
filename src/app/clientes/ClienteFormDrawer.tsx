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
import { IMaskInput } from "react-imask";
import { useCliente } from "@/hooks/useCliente";
import { toast } from "sonner";
import { Cliente } from "@/core/models/Cliente";

interface ClienteFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente?: Cliente;
    onSuccess?: (cliente: Cliente) => void;
}

export function ClienteFormDrawer({ open, onOpenChange, cliente, onSuccess }: ClienteFormDrawerProps) {

    // Estados do Formulário
    const { criar, atualizar } = useCliente();
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [id, setId] = useState("");


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            const timeout = setTimeout(() => {
                setNome("");
                setTelefone("");
            }, 300);

            return () => clearTimeout(timeout);
        }

        if (cliente) {
            setNome(cliente.nome);
            setTelefone(cliente.telefone || "");
            setId(cliente.id || "");
        }

    }, [open, cliente]);

    const handleSave = async () => {
        if (!nome || !telefone) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        if (telefone.length < 10) {
            toast.warning("O telefone parece incompleto. Digite o DDD + Número.");
            return;
        }

        setLoading(true);
        try {
            let result;
            if (!id) {
                result = await criar({ nome: nome, telefone: telefone });
            } else {
                result = await atualizar(id, { nome: nome, telefone: telefone });
            }

            const novo = {
                id: id || result,
                nome,
                telefone
            };

            toast.success(`Cliente ${!id ? "criado" : "atualizado"} com sucesso!`);
            onOpenChange(false);
            setNome("");
            setTelefone("");
            onSuccess?.(novo as Cliente);
            return result;
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
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
                        <DrawerTitle>{!id ? "Novo" : "Editar"} Cliente</DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Nome *</Label>
                            <Input
                                type="text"
                                placeholder="Nome do cliente"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-2 flex flex-col">
                                <Label>Telefone *</Label>
                                <IMaskInput
                                    mask={[
                                        { mask: '(00) 0000-0000' },
                                        { mask: '(00) 00000-0000' }
                                    ]}
                                    value={telefone}
                                    unmask
                                    onAccept={(value: string) => setTelefone(value)}
                                    placeholder="(99) 99999-9999"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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