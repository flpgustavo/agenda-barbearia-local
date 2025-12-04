import { useBase } from "./useBase";
import { ServicoService } from "../core/services/ServicoService";
import { Servico } from "../core/models/Servico";

export function useServico() {
    return useBase<Servico>(ServicoService);
}
