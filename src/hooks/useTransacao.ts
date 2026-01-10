import { useBase } from "./useBase";
import { useCallback } from "react";
import { Transacao } from "@/core/models/Transacao";
import { transacaoService } from "@/core/services/TransacaoService";

export function useTransacao() {
    const base = useBase<Transacao>(transacaoService);

    return {
        ...base,
    };
}