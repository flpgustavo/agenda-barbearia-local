'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Usuario } from "@/core/models/Usuario";
import { useBackup } from "@/hooks/useBackup";
import useUsuario from "@/hooks/useUsuario";
import { Loader2, Download, Upload, FileUp, RefreshCw, CircleUserRound } from "lucide-react"; // Adicionei ícones
import { FormEvent, useEffect, useRef, useState } from "react"; // Adicionei useRef
import { toast } from "sonner";

export default function PerfilPage() {

    const { fazerBackup, restaurarBackup, loading } = useBackup();
    const { items, atualizar } = useUsuario();
    const [usuario, setUsuario] = items[0] ? useState<Usuario>(items[0]) : useState<Usuario | null>(null);

    // Referência para manipular o input de arquivo
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (items && items.length > 0) {
            setUsuario(items[0]);
        }
    }, [items]);

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

    // Função separada para lidar com a seleção do arquivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];

        toast.promise(restaurarBackup(file, 'senha'), {
            loading: "Restaurando backup ...",
            success: () => {
                // ✅ Limpa o input após o sucesso
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return "Backup restaurado com sucesso!";
            },
            error: (err: Error) => {
                // Opcional: Limpar também no erro se desejar que o usuário tente o mesmo arquivo
                if (fileInputRef.current) fileInputRef.current.value = "";
                return err instanceof Error ? err.message : "Falha ao restaurar backup.";
            },
        });
    };

    if (!usuario && !items[0]) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /> Carregando perfil...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-24 p-6">
            {/* Card de Perfil mantido igual */}
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
                                    <FieldLegend className="text-center text-sm font-medium">
                                        Horário de Atendimento
                                    </FieldLegend>
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
                                <Button type="submit" className="w-full">
                                    Atualizar Perfil
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            {/* Card de Backup Estilizado */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Backup e Restauração
                    </CardTitle>
                    <CardDescription>Gerencie a segurança dos seus dados.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">

                    {/* Área de Download (Backup) */}
                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2 font-medium">
                            <Download className="h-4 w-4 text-primary" />
                            Exportar Dados
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Baixe uma cópia segura de todos os seus registros atuais.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full mt-auto border-primary/20 hover:bg-primary/5 hover:text-primary"
                            onClick={() => {
                                toast.promise(fazerBackup("senha"), {
                                    loading: "Gerando arquivo de backup ...",
                                    success: "Download iniciado!",
                                    error: (err: Error) => err instanceof Error ? err.message : "Falha ao fazer backup.",
                                });
                            }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Fazer Backup
                        </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept=".backup"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            disabled={loading}
                        />
                        <label
                            onClick={() => !loading && fileInputRef.current?.click()}
                            className={`
                                flex flex-col items-center justify-center gap-2 p-6 
                                border-2 border-dashed rounded-lg cursor-pointer 
                                transition-all duration-200 h-full bg-muted/20
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 hover:border-primary/50'}
                            `}
                        >
                            <div className="p-3 bg-background rounded-full shadow-sm border">
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-primary">
                                    Clique para selecionar o backup
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Suporta arquivos .backup
                                </p>
                            </div>
                        </label>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}