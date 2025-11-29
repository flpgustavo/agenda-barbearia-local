import { BaseService } from "./BaseService";
import { Servico } from "../models/Servico";
import { db } from "../db";

class ServicoServiceClass extends BaseService<Servico> {
    constructor() {
        super('servicos' as keyof typeof db);
    }
}


export const ServicoService = new ServicoServiceClass();
