import { Table } from "dexie";
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

    async import(
        file: File,
        password: string,
        modo: 'sobrescrever' | 'mesclar' = 'sobrescrever'
    ): Promise<void> {
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
                [db.clientes, db.servicos, db.usuarios, db.agendamentos],
                async () => {
                    // Definimos as chaves que existem no objeto decrypted
                    const tabelas = ["clientes", "servicos", "usuarios", "agendamentos"] as const;

                    for (const nomeTabela of tabelas) {
                        const dadosNovos = decrypted[nomeTabela];
                        if (!Array.isArray(dadosNovos) || dadosNovos.length === 0) continue;

                        const tabela = db[nomeTabela] as Table<any, any>;

                        if (modo === 'sobrescrever') {
                            await tabela.clear();
                            await tabela.bulkAdd(dadosNovos);
                        } else {
                            await tabela.bulkPut(dadosNovos);
                        }
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

    async reset(): Promise<void> {
        try {
            await db.transaction(
                "rw", 
                [db.clientes, db.servicos, db.usuarios, db.agendamentos], 
                async () => {
                    await db.clientes.clear();
                    await db.servicos.clear();
                    await db.usuarios.clear();
                    await db.agendamentos.clear();
                }
            );
        } catch (error: any) {
            throw new Error(`Erro ao limpar o banco de dados: ${error.message}`);
        }
    }
};