import Dexie, { Table } from "dexie";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";
import { Usuario } from "../models/Usuario";
import { Agendamento } from "../models/Agendamento";

export class Database extends Dexie {
    clientes!: Table<Cliente, number>;
    servicos!: Table<Servico, number>;
    usuarios!: Table<Usuario, number>;
    agendamentos!: Table<Agendamento, number>;

    constructor() {
        super("agenda-barbearia");

        this.version(1).stores({
            clientes: "++id, nome, telefone, createdAt, updatedAt",
            servicos: "++id, nome, duracaoMinutos, preco, createdAt, updatedAt",
            usuarios: "++id, nome, inicio, fim, intervaloInicio, intervaloFim, createdAt, updatedAt",
            agendamentos: "++id, clienteId, dataHora, status, createdAt, updatedAt"
        });
    }
}

export const db = new Database();
