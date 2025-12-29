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
import { Usuario } from "@/core/models/Usuario";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useUsuario from "@/hooks/useUsuario";

export default function Register() {
    const navigate = useRouter();
    const { criar } = useUsuario();

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const dados: Omit<Usuario, "id" | "createdAt" | "updatedAt"> = {
            nome: formData.get("nome") as string,
            inicio: formData.get("inicio") as string,
            fim: formData.get("fim") as string,
            intervaloInicio: (formData.get("intervaloInicio") as string) || "",
            intervaloFim: (formData.get("intervaloFim") as string) || "",
        };

        toast.promise(
            criar(dados),
            {
                loading: "Configurando sua conta ...",
                success: () => {
                    navigate.push("/agendamentos");
                    return "Conta criada com sucesso!";
                },
                error: (err: Error) => {
                    return err instanceof Error ? err.message : "Falha ao criar conta.";
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-[calc(100%-2rem)] max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Registre-se
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Para criar uma conta, preencha os campos abaixo.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4">
                    <form onSubmit={handleRegister}>
                        <FieldGroup>
                            <FieldSet>
                                <Field>
                                    <FieldLabel>Nome</FieldLabel>
                                    <Input name="nome" placeholder="Digite seu nome" required />
                                </Field>

                                <FieldSeparator />

                                <FieldSet>
                                    <FieldLegend className="text-center text-sm font-medium">
                                        Informações sobre seu horário de Atendimento
                                    </FieldLegend>
                                </FieldSet>

                                <Field>
                                    <FieldLabel>Início *</FieldLabel>
                                    <Input name="inicio" type="time" required />
                                </Field>

                                <Field>
                                    <FieldLabel>Início de Intervalo</FieldLabel>
                                    <Input name="intervaloInicio" type="time" />
                                </Field>

                                <Field>
                                    <FieldLabel>Fim de Intervalo</FieldLabel>
                                    <Input name="intervaloFim" type="time" />
                                </Field>

                                <Field>
                                    <FieldLabel>Fim *</FieldLabel>
                                    <Input name="fim" type="time" required />
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

                <CardFooter className="justify-center">
                    <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                        Ao continuar, você aceita nossos{" "}
                        <Link
                            href="/termos"
                            className="underline hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                            Termos de Uso
                        </Link>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}