import { db } from '../db';
import { Cliente } from '../models/Cliente';

export const ClienteService = {
  async list(): Promise<Cliente[]> {
    return db.clientes.toArray();
  },

  async get(id: number): Promise<Cliente | undefined> {
    return db.clientes.get(id);
  },

  async create(data: Omit<Cliente, 'id'>): Promise<number> {
    return db.clientes.add(data as Cliente);
  },

  async update(id: number, patch: Partial<Cliente>): Promise<number | undefined> {
    await db.clientes.update(id, patch);
    return id;
  },

  async remove(id: number): Promise<void> {
    await db.clientes.delete(id);
  }
};
