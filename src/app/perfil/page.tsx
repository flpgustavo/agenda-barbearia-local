'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Usuario } from "@/core/models/Usuario";
import { useBackup } from "@/hooks/useBackup";
import useUsuario from "@/hooks/useUsuario";
import { Loader2, Download, Upload, FileUp, RefreshCw, CircleUserRound, AlertTriangle } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PerfilPage() {
    const { fazerBackup, restaurarBackup, loading } = useBackup();
    const { items, atualizar } = useUsuario();
    const usuario = items?.[0] || null;
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const temDados = items.length > 0;

        if (temDados) {
            setPendingFile(file);
            setIsConfirmOpen(true);
        } else {
            executarImportacao(file, 'sobrescrever');
        }
    };

    const executarImportacao = async (file: File, modo: 'sobrescrever' | 'mesclar') => {
        setIsConfirmOpen(false);

        toast.promise(restaurarBackup(file, 'senha', modo), {
            loading: modo === 'mesclar' ? "Mesclando dados..." : "Substituindo banco de dados...",
            success: () => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setPendingFile(null);
                return "Restauração concluída com sucesso!";
            },
            error: (err: Error) => {
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

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Backup e Restauração
                    </CardTitle>
                    <CardDescription>Gerencie a segurança dos seus dados.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2 font-medium">
                            <Download className="h-4 w-4 text-primary" />
                            Exportar Dados
                        </div>
                        <p className="text-sm text-muted-foreground">Baixe uma cópia segura de todos os seus registros atuais.</p>
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
                            onChange={handleFileChange}
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
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-primary">Clique para selecionar o backup</p>
                                <p className="text-xs text-muted-foreground">Suporta arquivos .backup</p>
                            </div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="w-[95vw] max-w-lg rounded-2xl md:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Atenção
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed">
                            O banco de dados não está vazio. Como deseja processar o arquivo:
                            <span className="block mt-1 font-mono text-xs bg-muted p-1 rounded break-all">
                                {pendingFile?.name}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid grid-cols-1 gap-3 py-4">
                        <Button
                            variant="outline"
                            className="flex items-center justify-start gap-4 h-auto p-4 whitespace-normal text-left hover:border-blue-500/50"
                            onClick={() => pendingFile && executarImportacao(pendingFile, 'mesclar')}
                        >
                            <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                <RefreshCw className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">Mesclar</p>
                                <p className="text-xs text-muted-foreground">Adiciona o backup ao que você já tem. Ideal para não perder nada.</p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex items-center justify-start gap-4 h-auto p-4 whitespace-normal text-left border-destructive/10 hover:bg-destructive/5 hover:border-destructive/40"
                            onClick={() => pendingFile && executarImportacao(pendingFile, 'sobrescrever')}
                        >
                            <div className="bg-red-100 p-2 rounded-full shrink-0">
                                <FileUp className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-red-600 text-sm">Sobrescrever Tudo</p>
                                <p className="text-xs text-muted-foreground">Apaga os dados atuais e usa apenas os do arquivo. Use com cautela.</p>
                            </div>
                        </Button>
                    </div>

                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto" onClick={() => { if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                            Cancelar
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}