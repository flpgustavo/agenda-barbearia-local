import { db } from '../db';

export const BackupService = {
  async generateBackupJSON(): Promise<string> {
    const backup = {
      usuarios: await db.usuarios.toArray(),
      clientes: await db.clientes.toArray(),
      servicos: await db.servicos.toArray(),
      agendamentos: await db.agendamentos.toArray()
    };

    return JSON.stringify(backup, null, 2);
  },

  /**
   * Restaura o banco (sobrescreve tudo).
   * json: string com o mesmo formato gerado por generateBackupJSON
   */
  async restoreFromJSON(json: string): Promise<void> {
    const data = JSON.parse(json);

    await db.transaction('rw', db.usuarios, db.clientes, db.servicos, db.agendamentos, async () => {
      await db.usuarios.clear();
      await db.clientes.clear();
      await db.servicos.clear();
      await db.agendamentos.clear();

      if (Array.isArray(data.usuarios) && data.usuarios.length) {
        await db.usuarios.bulkAdd(data.usuarios);
      }
      if (Array.isArray(data.clientes) && data.clientes.length) {
        await db.clientes.bulkAdd(data.clientes);
      }
      if (Array.isArray(data.servicos) && data.servicos.length) {
        await db.servicos.bulkAdd(data.servicos);
      }
      if (Array.isArray(data.agendamentos) && data.agendamentos.length) {
        await db.agendamentos.bulkAdd(data.agendamentos);
      }
    });
  }
};
