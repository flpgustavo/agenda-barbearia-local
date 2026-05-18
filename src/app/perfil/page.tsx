'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Usuario } from "@/core/models/Usuario";
import useUsuario from "@/hooks/useUsuario";
import { Loader2, CircleUserRound } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";

export default function PerfilPage() {
    const { items, atualizar } = useUsuario();
    const usuario = items?.[0] || null;

    async function handleUpdate(event: FormEvent<HTMLFormElement>) {
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
            atualizar(usuario?.id as string, dados),
            {
                loading: "Atualizando sua conta ...",
                success: "Conta atualizada com sucesso!",
                error: (err: Error) => err instanceof Error ? err.message : "Falha ao atualizar conta.",
            }
        );
    }

    if (!usuario && !items[0]) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /> Carregando perfil...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-24 p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CircleUserRound className="h-5 w-5" />
                        Seu Perfil
                    </CardTitle>
                    <CardDescription>Gerencie as informações do seu perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4" key={usuario?.id || 'loading'}>
                        <FieldGroup>
                            <FieldSet>
                                <Field>
                                    <FieldLabel>Nome</FieldLabel>
                                    <Input name="nome" defaultValue={usuario?.nome || ''} placeholder="Digite seu nome" required />
                                </Field>
                                <FieldSeparator />
                                <FieldSet>
                                    <FieldLegend className="text-center text-sm font-medium">Horário de Atendimento</FieldLegend>
                                </FieldSet>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel>Início *</FieldLabel>
                                        <Input name="inicio" type="time" defaultValue={usuario?.inicio || ''} required />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Fim *</FieldLabel>
                                        <Input name="fim" type="time" defaultValue={usuario?.fim || ''} required />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel>Início Intervalo</FieldLabel>
                                        <Input name="intervaloInicio" type="time" defaultValue={usuario?.intervaloInicio || ''} />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Fim Intervalo</FieldLabel>
                                        <Input name="intervaloFim" type="time" defaultValue={usuario?.intervaloFim || ''} />
                                    </Field>
                                </div>
                            </FieldSet>
                            <div className="pt-4">
                                <Button type="submit" className="w-full">Atualizar Perfil</Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
