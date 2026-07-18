'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBackup } from "@/hooks/useBackup";
import useUsuario from "@/hooks/useUsuario";
import { useTour } from "@/hooks/useTour";
import { Loader2, Download, Upload, FileUp, RefreshCw, AlertTriangle, Trash2, PlayCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BackupService } from "@/core/services/BackupService";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function MeusDadosPage() {
    const { fazerBackup, restaurarBackup, loading } = useBackup();
    const { items } = useUsuario();
    const { startTour } = useTour();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importMode, setImportMode] = useState<'mesclar' | 'sobrescrever'>('mesclar');

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

    const handleResetDatabase = async () => {
        try {
            await BackupService.reset();
            setIsResetOpen(false);
            toast.success("Dados da barbearia limpos! Seu perfil foi preservado.");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            toast.error(error.message || "Erro ao limpar banco de dados");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 p-6 space-y-6">
            <Card>
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        Tutorial
                    </CardTitle>
                    <CardDescription>Reaprenda como usar o aplicativo com o tour guiado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-muted/20">
                        <div className="space-y-1 text-center">
                            <p className="font-medium">Tour de Boas-Vindas</p>
                            <p className="text-sm text-muted-foreground">
                                Refresque sua memória sobre como criar clientes, agendar serviços e registrar transações.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                            onClick={() => startTour()}
                        >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Tutorial
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Zona de Perigo
                    </CardTitle>
                    <CardDescription>
                        Ações irreversíveis. Seu perfil de usuário não é afetado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                        <div className="space-y-1">
                            <p className="font-medium text-red-900 dark:text-red-200">Apagar dados da barbearia</p>
                            <p className="text-sm text-red-700/80 dark:text-red-300/70">
                                Remove clientes, serviços, agendamentos e transações. Seu perfil permanece intacto.
                            </p>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setIsResetOpen(true)}
                            className="shrink-0 mt-4"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Apagar Tudo
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="w-[95vw] max-w-lg rounded-2xl md:w-full bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Atenção
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed text-left">
                            O banco de dados não está vazio. Como deseja processar o arquivo:
                            <span className="block mt-1 font-mono text-xs bg-muted p-1 rounded break-all">
                                {pendingFile?.name}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <RadioGroup
                            value={importMode}
                            onValueChange={(v) => setImportMode(v as 'mesclar' | 'sobrescrever')}
                            className="grid grid-cols-1 gap-3"
                        >
                            <Label
                                htmlFor="mesclar"
                                className={cn(
                                    "flex items-center justify-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/20",
                                    importMode === "mesclar" ? "border-primary bg-primary/5 dark:bg-primary/20" : "border-muted"
                                )}
                            >
                                <RadioGroupItem value="mesclar" id="mesclar" className="sr-only" />
                                <div className="bg-primary/15 dark:bg-primary/40 p-2 rounded-full shrink-0">
                                    <RefreshCw className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Mesclar Dados</p>
                                    <p className="text-xs text-muted-foreground font-normal leading-tight">
                                        Adiciona o backup ao que você já tem. Ideal para não perder nada.
                                    </p>
                                </div>
                            </Label>

                            <Label
                                htmlFor="sobrescrever"
                                className={cn(
                                    "flex items-center justify-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-red-500 hover:bg-red-500/5 dark:hover:bg-destructive/50",
                                    importMode === "sobrescrever" ? "border-red-500 bg-red-500/5 dark:bg-destructive/50" : "border-muted"
                                )}
                            >
                                <RadioGroupItem value="sobrescrever" id="sobrescrever" className="sr-only" />
                                <div className="bg-red-100 dark:bg-destructive p-2 rounded-full shrink-0">
                                    <FileUp className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Sobrescrever Tudo</p>
                                    <p className="text-xs text-muted-foreground font-normal leading-tight">
                                        Apaga os dados atuais e usa apenas os do arquivo. Use com cautela.
                                    </p>
                                </div>
                            </Label>
                        </RadioGroup>
                    </div>

                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            className="w-full sm:w-auto"
                            onClick={() => { if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <Button
                            className={cn(
                                "w-full sm:w-auto",
                                importMode === 'sobrescrever' ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90",
                            )}
                            onClick={() => pendingFile && executarImportacao(pendingFile, importMode)}
                        >
                            Confirmar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Apagar dados da barbearia?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            Essa ação não pode ser desfeita. Excluirá todos os dados operacionais (clientes, serviços, agendamentos e transações), mas seu perfil será mantido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleResetDatabase}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Sim, apagar tudo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
