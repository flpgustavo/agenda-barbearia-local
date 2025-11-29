import { BaseService } from "./BaseService";
import { db } from "../db";
import { Cliente } from "../models/Cliente";

export class ClienteService extends BaseService<Cliente> {
    constructor() {
        super('clientes');
    }
}

export const clienteService = new ClienteService();
