import { db } from "../db";
import { Crypto } from "../utils/Crypto";

export const BackupService = {

    async export(password: string): Promise<void> {
        const data = {
            clientes: await db.clientes.toArray(),
            servicos: await db.servicos.toArray(),
            usuarios: await db.usuarios.toArray(),
            agendamentos: await db.agendamentos.toArray(),
        };

        const encryptedBlob = await Crypto.encrypt(password, data);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(encryptedBlob);
        link.download = `barbearia-backup-${new Date().toISOString()}.backup`;
        link.click();
    },

    async import(file: File, password: string): Promise<void> {
        const decrypted = await Crypto.decrypt(password, file);

        await db.transaction('rw',
            db.clientes,
            db.servicos,
            db.usuarios,
            db.agendamentos,
            async () => {

                await db.clientes.clear();
                await db.servicos.clear();
                await db.usuarios.clear();
                await db.agendamentos.clear();

                await db.clientes.bulkAdd(decrypted.clientes || []);
                await db.servicos.bulkAdd(decrypted.servicos || []);
                await db.usuarios.bulkAdd(decrypted.usuarios || []);
                await db.agendamentos.bulkAdd(decrypted.agendamentos || []);
            }
        );
    }
};
