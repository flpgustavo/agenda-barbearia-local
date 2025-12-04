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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useServico } from "@/hooks/useServico";
import { Servico } from "@/core/models/Servico";

export default function NovoServico() {
    const navigate = useRouter();
    const { criar } = useServico();

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const dados: Omit<Servico, "id" | "createdAt" | "updatedAt"> = {
            nome: formData.get("nome") as string,
            preco: parseFloat(formData.get("preco") as string) || 0,
            duracaoMinutos: parseFloat(formData.get("duracaoMinutos") as string) || 0,
        };

        toast.promise(
            criar(dados),
            {
                loading: "Criando serviço ...",
                success: () => {
                    navigate.push("/servicos");
                    return "Serviço criado com sucesso!";
                },
                error: (err: Error) => {
                    return err instanceof Error ? err.message : "Falha ao criar serviço.";
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Criar serviço
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4">
                    <form onSubmit={handleCreate}>
                        <FieldGroup>
                            <FieldSet>
                                <Field>
                                    <FieldLabel>Nome *</FieldLabel>
                                    <Input name="nome" placeholder="Digite o nome do serviço" required />
                                </Field>

                                <Field>
                                    <FieldLabel>Preço *</FieldLabel>
                                    <Input name="preco" type="number" placeholder="Digite o preço do serviço" required />
                                </Field>

                                <Field>
                                    <FieldLabel>Duração em Minutos *</FieldLabel>
                                    <Input name="duracaoMinutos" type="number" placeholder="Digite a duração do serviço" required />
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