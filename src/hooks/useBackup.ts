import { useState } from "react";
import { BackupService } from "../core/services/BackupService";

export function useBackup() {
    const [loading, setLoading] = useState(false);

    async function fazerBackup(password: string) {
        setLoading(true);
        await BackupService.export(password);
        setLoading(false);
    }

    async function restaurarBackup(file: File, password: string) {
        setLoading(true);
        await BackupService.import(file, password);
        setLoading(false);
    }

    return { fazerBackup, restaurarBackup, loading };
}
