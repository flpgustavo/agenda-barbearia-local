import { useBase } from "./useBase";
import { servicoService } from "../core/services/ServicoService";
import { Servico } from "../core/models/Servico";
import { queryKeys } from "../lib/queryKeys";

export function useServico() {
    return useBase<Servico>(servicoService, queryKeys.servicos);
}
