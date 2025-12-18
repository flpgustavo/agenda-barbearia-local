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
import { cn } from "@/lib/utils";

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
                                    className={cn(
                                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                    )}
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