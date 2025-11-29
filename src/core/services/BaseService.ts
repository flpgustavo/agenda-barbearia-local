// src/services/BaseService.ts
import Dexie, { UpdateSpec } from "dexie";
import { db } from "../db";

export class BaseService<T extends { id?: string }> {
    protected table: Dexie.Table<T, string>;

    constructor(tableName: keyof typeof db) {
        // @ts-ignore - acesso dinâmico ao Dexie
        this.table = db[tableName];
    }

    async list(): Promise<T[]> {
        return await this.table.toArray();
    }

    async get(id: string): Promise<T | undefined> {
        return await this.table.get(id);
    }

    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<string> {
        const now = new Date().toISOString();

        const item = {
            ...data,
            createdAt: now,
            updatedAt: now
        } as unknown as T;

        return await this.table.add(item);
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        const now = new Date().toISOString();

        await this.table.update(id, {
            ...data,
            updatedAt: now
        } as UpdateSpec<T>);
    }

    async delete(id: string): Promise<void> {
        await this.table.delete(id);
    }
}
