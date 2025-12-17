import { useState } from "react";
import { BackupService } from "../core/services/BackupService";

export function useBackup() {
    const [loading, setLoading] = useState(false);

    async function fazerBackup(password: string) {
        setLoading(true);
        try {
            await BackupService.export(password);
        } catch (error: any) {
            throw error; 
        } finally {
            setLoading(false);
        }
    }

    async function restaurarBackup(file: File, password: string) {
        setLoading(true);
        try {
            await BackupService.import(file, password);
        } catch (error: any) {
            throw error; 
        } finally {
            setLoading(false);
        }
    }

    return { fazerBackup, restaurarBackup, loading };
}