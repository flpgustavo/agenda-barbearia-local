'use client'

import { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useCliente } from "@/hooks/useCliente";
import { Cliente } from "@/core/models/Cliente";

export default function NovoCliente() {
    const navigate = useRouter();
    const { criar } = useCliente();

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const dados: Omit<Cliente, "id" | "createdAt" | "updatedAt"> = {
            nome: formData.get("nome") as string,
            telefone: formData.get("telefone") as string,
        };

        toast.promise(
            criar(dados),
            {
                loading: "Criando cliente ...",
                success: () => {
                    navigate.push("/clientes");
                    return "Cliente criado com sucesso!";
                },
                error: (err: Error) => {
                    return err instanceof Error ? err.message : "Falha ao criar cliente.";
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Novo cliente
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4">
                    <form onSubmit={handleCreate}>
                        <FieldGroup>
                            <FieldSet>
                                <Field>
                                    <FieldLabel>Nome *</FieldLabel>
                                    <Input name="nome" placeholder="Digite o nome do cliente" required />
                                </Field>

                                <Field>
                                    <FieldLabel>Telefone *</FieldLabel>
                                    <Input name="telefone" type="number" step="1" placeholder="Digite o telefone do seu cliente" required />
                                </Field>
                            </FieldSet>

                            <div className="pt-4">
                                <Button type="submit" className="w-full">
                                    Cadastrar
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}