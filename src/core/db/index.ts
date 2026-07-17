import Dexie, { Table } from "dexie";
import { Cliente } from "../models/Cliente";
import { Servico } from "../models/Servico";
import { Usuario } from "../models/Usuario";
import { Agendamento } from "../models/Agendamento";
import { Transacao } from "../models/Transacao";

export class Database extends Dexie {
    clientes!: Table<Cliente, string>;
    servicos!: Table<Servico, string>;
    usuarios!: Table<Usuario, string>;
    agendamentos!: Table<Agendamento, string>;
    transacoes!: Table<Transacao, string>;

    constructor() {
        super("agenda-barbearia");

        this.version(2).stores({
            clientes: "id, nome, telefone, createdAt, updatedAt",
            servicos: "id, nome, duracaoMinutos, preco, createdAt, updatedAt",
            usuarios: "id, nome, inicio, fim, intervaloInicio, intervaloFim, createdAt, updatedAt",
            agendamentos: "id, clienteId, servicoId, dataHora, status, createdAt, updatedAt",
            transacoes: "id, agendamentoId, dataHora, status, createdAt, updatedAt",
        });
    }
}

let _db: Database | null = null;

export function getDb(): Database {
    if (!_db) {
        _db = new Database();
        if (typeof window !== "undefined") {
            _db.on("ready", async () => {
                const { seedDatabase } = await import("./seeder");
                await seedDatabase(_db!);
            });
            _db.open().catch((err) => {
                console.error("Falha ao abrir o banco de dados:", err.stack || err);
            });
        }
    }
    return _db;
}
