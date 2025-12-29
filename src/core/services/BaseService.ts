import Dexie, { UpdateSpec } from "dexie";
import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';
import { Logger } from "../utils/Logger";
import { BaseModel } from "../models/BaseModel";


export class BaseService<T extends BaseModel> {
    protected table: Dexie.Table<T, string>;
    protected tableName: string;

    constructor(tableName: keyof typeof db) {
        // @ts-ignore
        this.table = db[tableName];
        this.tableName = String(tableName);
    }

    async list(): Promise<T[]> {
        try {
            return await this.table.toArray();
        } catch (error) {
            Logger.error(`Falha ao listar dados da tabela ${this.tableName}`, error);
            throw error;
        }
    }

    async get(id: string): Promise<T | undefined> {
        try {
            return await this.table.get(id);
        } catch (error) {
            Logger.error(`Falha ao buscar ID ${id} na tabela ${this.tableName}`, error);
            throw error;
        }
    }

    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const now = new Date().toISOString();
            const id = uuidv4();

            const item = {
                ...data,
                id: id,
                createdAt: now,
                updatedAt: now
            } as unknown as T;

            await this.table.add(item);
            Logger.info(`Item criado na tabela ${this.tableName}`, item); 
            return id;

        } catch (error) {
            Logger.error(`Erro ao criar item na tabela ${this.tableName}`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        try {
            const now = new Date().toISOString();
            await this.table.update(id, {
                ...data,
                updatedAt: now
            } as UpdateSpec<T>);
            Logger.info(`Item ${id} atualizado na tabela ${this.tableName}`);

        } catch (error) {
            Logger.error(`Erro ao atualizar ID ${id} na tabela ${this.tableName}`, error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.table.delete(id);
            Logger.info(`Item ${id} removido da tabela ${this.tableName}`);
        } catch (error) {
            Logger.error(`Erro ao remover ID ${id} na tabela ${this.tableName}`, error);
            throw error;
        }
    }
}