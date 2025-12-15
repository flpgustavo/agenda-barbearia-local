// hooks/useBase.ts
import { useEffect, useMemo, useState } from "react";
import { BaseModel } from "../core/models/BaseModel";
import { BaseService } from "../core/services/BaseService";

export interface BaseFilters<T> {
    predicate?: (item: T) => boolean;
}

export interface UseBaseOptions<T> {
    filters?: BaseFilters<T>;
    autoLoad?: boolean;
    transform?: (items: T[]) => T[]; // ex: join, sort, agregações simples
}

export function useBase<T extends BaseModel>(
    service: BaseService<T>,
    options?: UseBaseOptions<T>
) {
    const [rawItems, setRawItems] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function carregar() {
        try {
            setLoading(true);
            const data = await service.list();
            setRawItems(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }

    async function criar(data: Omit<T, "id" | "createdAt" | "updatedAt">) {
        const id = await service.create(data);
        await carregar();
        return id;
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
        if (options?.autoLoad ?? true) {
            carregar();
        }
    }, []);

    // aplica filtros + transformações
    const items = useMemo(() => {
        let result = [...rawItems];

        if (options?.filters?.predicate) {
            result = result.filter(options.filters.predicate);
        }

        if (options?.transform) {
            result = options.transform(result);
        }

        return result;
    }, [rawItems, options?.filters, options?.transform]);

    return {
        items,          // já filtrados/transformados
        rawItems,       // dados brutos
        loading,
        error,
        criar,
        atualizar,
        remover,
        recarregar: carregar,
    };
}