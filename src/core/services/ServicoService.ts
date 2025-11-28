import { db } from '../db';
import { Servico } from '../models/Servico';

export const ServicoService = {
  async list(): Promise<Servico[]> {
    return db.servicos.toArray();
  },

  async get(id: number): Promise<Servico | undefined> {
    return db.servicos.get(id);
  },

  async create(data: Omit<Servico, 'id'>): Promise<number> {
    return db.servicos.add(data as Servico);
  },

  async update(id: number, patch: Partial<Servico>): Promise<number | undefined> {
    await db.servicos.update(id, patch);
    return id;
  },

  async remove(id: number): Promise<void> {
    await db.servicos.delete(id);
  }
};
