import { BaseService } from "./BaseService";
import { db } from "../db";
import { Cliente } from "../models/Cliente";

export class ClienteService extends BaseService<Cliente> {
    constructor() {
        super('clientes');
    }

    private async validarExclusao(id: string): Promise<void> {
        const agendamentosAtivos = await db.agendamentos
            .where("clienteId")
            .equals(id)
            .filter(ag => ag.status !== "CANCELADO")
            .toArray();

        if (agendamentosAtivos.length > 0) {
            throw new Error(
                `Não é possível excluir este cliente. Existem ${agendamentosAtivos.length} agendamento(s) vinculado(s) a ele.`
            );
        }
    }

    async remove(id: string): Promise<void> {
        await this.validarExclusao(id);
        return super.remove(id);
    }

    list = super.list;
    get = super.get;
    create = super.create;
    update = super.update;
}

export const clienteService = new ClienteService();