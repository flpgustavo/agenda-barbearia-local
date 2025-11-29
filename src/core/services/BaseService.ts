import Dexie, { UpdateSpec } from "dexie";
import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from "../models/BaseModel";


export class BaseService<T extends BaseModel> {
    protected table: Dexie.Table<T, string>;

    constructor(tableName: keyof typeof db) {
        // @ts-ignore - Acesso dinâmico à tabela do Dexie
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
        const id = uuidv4();

        const item = {
            ...data,
            id: id, 
            createdAt: now,
            updatedAt: now
        } as unknown as T;

        await this.table.add(item);
        return id;
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        const now = new Date().toISOString();

        await this.table.update(id, {
            ...data,
            updatedAt: now
        } as UpdateSpec<T>);
    }

    async remove(id: string): Promise<void> {
        await this.table.delete(id);
    }
}