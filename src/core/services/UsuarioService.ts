import { db } from '../db';
import { Usuario } from '../models/Usuario';

export const UsuarioService = {
  async list(): Promise<Usuario[]> {
    return db.usuarios.toArray();
  },

  async get(id: number): Promise<Usuario | undefined> {
    return db.usuarios.get(id);
  },

  async create(data: Omit<Usuario, 'id'>): Promise<number> {
    return db.usuarios.add(data as Usuario);
  },

  async update(id: number, patch: Partial<Usuario>): Promise<number | undefined> {
    await db.usuarios.update(id, patch);
    return id;
  },

  async remove(id: number): Promise<void> {
    await db.usuarios.delete(id);
  }
};
