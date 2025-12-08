"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react"; // Ícone de loading opcional
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
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

import { useAgendamento } from "@/hooks/useAgendamento";
import { useCliente } from "@/hooks/useCliente";
import { useServico } from "@/hooks/useServico";
import { toast } from "sonner";
import { set } from "date-fns";
import { te } from "date-fns/locale";
import { Cliente } from "@/core/models/Cliente";

interface ClienteFormDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cliente?: Cliente;
}

export function ClienteFormDrawer({ open, onOpenChange, cliente }: ClienteFormDrawerProps) {

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

        setLoading(true);
        try {
            !id ?
            await criar({
                nome: nome,
                telefone: telefone,
            }) :
            await atualizar(id, {
                nome: nome,
                telefone: telefone,
            });

            onOpenChange(false);
            setNome("");
            setTelefone("");
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
                                <Input
                                    type="tel"
                                    placeholder="(99) 99999-9999"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
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