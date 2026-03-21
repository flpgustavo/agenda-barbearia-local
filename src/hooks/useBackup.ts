import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BackupService } from "../core/services/BackupService";

export function useBackup() {
    const queryClient = useQueryClient();

    const backupMutation = useMutation({
        mutationFn: (password: string) => BackupService.export(password),
    });

    const restaurarMutation = useMutation({
        mutationFn: ({
            file,
            password,
            modo,
        }: {
            file: File;
            password: string;
            modo: 'sobrescrever' | 'mesclar';
        }) => BackupService.import(file, password, modo),
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
    });

    async function fazerBackup(password: string) {
        return backupMutation.mutateAsync(password);
    }

    async function restaurarBackup(
        file: File,
        password: string,
        modo: 'sobrescrever' | 'mesclar' = 'sobrescrever'
    ) {
        return restaurarMutation.mutateAsync({ file, password, modo });
    }

    const loading = backupMutation.isPending || restaurarMutation.isPending;

    return { fazerBackup, restaurarBackup, loading };
}