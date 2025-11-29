import Dexie, { Table } from "dexie";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";
import { Usuario } from "../models/Usuario";
import { Agendamento } from "../models/Agendamento";

export class Database extends Dexie {
    clientes!: Table<Cliente, string>;
    servicos!: Table<Servico, string>;
    usuarios!: Table<Usuario, string>;
    agendamentos!: Table<Agendamento, string>;

    constructor() {
        super("agenda-barbearia");

        this.version(2).stores({
            clientes: "++id, nome, telefone, createdAt, updatedAt",
            servicos: "++id, nome, duracaoMinutos, preco, createdAt, updatedAt",
            usuarios: "++id, nome, inicio, fim, intervaloInicio, intervaloFim, createdAt, updatedAt",
            agendamentos: "++id, clienteId, dataHora, status, createdAt, updatedAt"
        });
    }
}

export const db = new Database();
