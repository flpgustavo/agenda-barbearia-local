import { db } from "../db";
import { Crypto } from "../utils/Crypto";

export const BackupService = {
    async export(password: string): Promise<void> {
        if (!password || password.trim().length === 0) {
            throw new Error("A senha é obrigatória para criar o backup.");
        }

        try {
            const data = {
                clientes: await db.clientes.toArray(),
                servicos: await db.servicos.toArray(),
                usuarios: await db.usuarios.toArray(),
                agendamentos: await db.agendamentos.toArray(),
            };

            const encryptedBlob = await Crypto.encrypt(password, data);

            const link = document.createElement("a");
            const url = URL.createObjectURL(encryptedBlob);
            link.href = url;
            link.download = `notebarber-backup-${new Date().toISOString().split("T")[0]}.backup`;
            link.click();

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error: any) {
            throw new Error(`Erro ao criar backup: ${error.message}`);
        }
    },

    async import(file: File, password: string): Promise<void> {
        if (!password || password.trim().length === 0) {
            throw new Error("A senha é obrigatória para restaurar o backup.");
        }

        if (!file) {
            throw new Error("Nenhum arquivo foi selecionado.");
        }

        const nome = file.name.toLowerCase();

        const extensaoValida =
            nome.endsWith(".backup") ||
            nome.endsWith(".txt") ||
            nome.endsWith(".backup.txt");

        if (!extensaoValida) {
            throw new Error("Arquivo inválido. Selecione um arquivo .backup ou .txt válido.");
        }

        try {
            const decrypted = await Crypto.decrypt(password, file);

            if (
                !decrypted ||
                typeof decrypted !== "object" ||
                !Array.isArray(decrypted.clientes) ||
                !Array.isArray(decrypted.servicos) ||
                !Array.isArray(decrypted.usuarios) ||
                !Array.isArray(decrypted.agendamentos)
            ) {
                throw new Error("Arquivo de backup corrompido ou inválido.");
            }

            await db.transaction(
                "rw",
                db.clientes,
                db.servicos,
                db.usuarios,
                db.agendamentos,
                async () => {

                    await db.clientes.clear();
                    await db.servicos.clear();
                    await db.usuarios.clear();
                    await db.agendamentos.clear();

                    if (decrypted.clientes.length > 0) {
                        await db.clientes.bulkAdd(decrypted.clientes);
                    }
                    if (decrypted.servicos.length > 0) {
                        await db.servicos.bulkAdd(decrypted.servicos);
                    }
                    if (decrypted.usuarios.length > 0) {
                        await db.usuarios.bulkAdd(decrypted.usuarios);
                    }
                    if (decrypted.agendamentos.length > 0) {
                        await db.agendamentos.bulkAdd(decrypted.agendamentos);
                    }
                }
            );
        } catch (error: any) {
            if (error.message?.includes("decrypt")) {
                throw new Error("Senha incorreta ou arquivo corrompido.");
            }
            throw new Error(`Erro ao restaurar backup: ${error.message}`);
        }
    },
};