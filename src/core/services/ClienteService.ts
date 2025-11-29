import { BaseService } from "./BaseService";
import { db } from "../db";
import { Cliente } from "../models/Cliente";

//Herda todos os métodos de BaseService
export class ClienteService extends BaseService<Cliente> {
    constructor() {
        super('clientes');
    }
    list = super.list;
    get = super.get;
    create = super.create;
    update = super.update;
    remove = super.delete;


}
export const clienteService = new ClienteService();
