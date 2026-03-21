import { useBase } from "./useBase";
import { Transacao } from "@/core/models/Transacao";
import { transacaoService } from "@/core/services/TransacaoService";
import { queryKeys } from "@/lib/queryKeys";

export function useTransacao() {
    const base = useBase<Transacao>(transacaoService, queryKeys.transacoes);

    return {
        ...base,
    };
}