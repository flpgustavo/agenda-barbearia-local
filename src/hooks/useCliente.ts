import { useBase } from "./useBase";
import { clienteService } from "../core/services/ClienteService";
import { Cliente } from "../core/models/Cliente";
import { queryKeys } from "../lib/queryKeys";

export function useCliente() {
    return useBase<Cliente>(clienteService, queryKeys.clientes);
}
