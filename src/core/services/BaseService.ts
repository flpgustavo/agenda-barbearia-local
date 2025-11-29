// src/services/BaseService.ts
import Dexie, { UpdateSpec } from "dexie";
import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';
export class BaseService<T extends { id?: number }> {
    protected table: Dexie.Table<T, number>;

    constructor(tableName: keyof typeof db) {
        // @ts-ignore - acesso dinâmico ao Dexie
        this.table = db[tableName];
    }

    async list(): Promise<T[]> {
        return await this.table.toArray();
    }

    async get(id: number): Promise<T | undefined> {
        return await this.table.get(id);
    }

    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<number> {
        const now = new Date().toISOString();

        const item = {
            ...data,
            id: uuidv4,
            createdAt: now,
            updatedAt: now
        } as unknown as T;

        return await this.table.add(item);
    }

    async update(id: number, data: Partial<T>): Promise<void> {
        const now = new Date().toISOString();

        await this.table.update(id, {
            ...data,
            updatedAt: now
        } as UpdateSpec<T>);
    }

    async delete(id: number): Promise<void> {
        await this.table.delete(id);
    }
}
