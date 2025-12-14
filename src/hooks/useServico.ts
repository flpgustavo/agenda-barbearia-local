import { useBase } from "./useBase";
import { servicoService } from "../core/services/ServicoService";
import { Servico } from "../core/models/Servico";

export function useServico() {
    return useBase<Servico>(servicoService);
}
