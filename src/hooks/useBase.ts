import { useEffect, useState } from "react";
import { BaseModel } from "../core/models/BaseModel";
import { BaseService } from "../core/services/BaseService";

export function useBase<T extends BaseModel>(service: BaseService<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function carregar() {
        try {
            setLoading(true);
            const data = await service.list();
            setItems(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }

    async function criar(data: Omit<T, "id" | "createdAt" | "updatedAt">) {
        try {
            await service.create(data);
            await carregar();
        } catch (err: any) {
            setError(err.message || "Erro ao criar");
        }
    }

    async function atualizar(id: string, data: Partial<T>) {
        try {
            await service.update(id, data);
            await carregar();
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar");
        }
    }

    async function remover(id: string) {
        try {
            await service.remove(id);
            await carregar();
        } catch (err: any) {
            setError(err.message || "Erro ao remover");
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    return {
        items,
        loading,
        error,
        criar,
        atualizar,
        remover,
        recarregar: carregar,
    };
}
