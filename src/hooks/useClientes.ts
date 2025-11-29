import { useBase } from "./useBase";
import { clienteService } from "../core/services/ClienteService";
import { Cliente } from "../core/models/Cliente";

export function useClientes() {
    return useBase<Cliente>(clienteService);
}
