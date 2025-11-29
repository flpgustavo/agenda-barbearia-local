import { useBase } from "./useBase";
import { ServicoService } from "../core/services/ServicoService";
import { Servico } from "../core/models/Servico";

export function useServicos() {
    return useBase<Servico>(ServicoService);
}
