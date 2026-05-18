import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { BaseModel } from "../core/models/BaseModel";
import { BaseService } from "../core/services/BaseService";

export interface BaseFilters<T> {
    predicate?: (item: T) => boolean;
}

export interface UseBaseOptions<T> {
    filters?: BaseFilters<T>;
    autoLoad?: boolean;
    transform?: (items: T[]) => T[];
}

export function useBase<T extends BaseModel>(
    service: BaseService<T>,
    queryKey: QueryKey,
    options?: UseBaseOptions<T>
) {
    const queryClient = useQueryClient();

    const {
        data: rawItems = [],
        isLoading: loading,
        error: queryError,
    } = useQuery({
        queryKey,
        queryFn: () => service.list(),
        enabled: options?.autoLoad ?? true,
    });

    const error = queryError ? (queryError as Error).message : null;

    const criarMutation = useMutation({
        mutationFn: (data: Omit<T, "id" | "createdAt" | "updatedAt">) =>
            service.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const atualizarMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
            service.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const removerMutation = useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    async function criar(data: Omit<T, "id" | "createdAt" | "updatedAt">) {
        return criarMutation.mutateAsync(data);
    }

    async function atualizar(id: string, data: Partial<T>) {
        return atualizarMutation.mutateAsync({ id, data });
    }

    async function remover(id: string) {
        return removerMutation.mutateAsync(id);
    }

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
        items,
        rawItems,
        loading,
        error,
        criar,
        atualizar,
        remover,
        recarregar: () => queryClient.invalidateQueries({ queryKey }),
    };
}