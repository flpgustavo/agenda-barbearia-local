import Dexie, { Table } from 'dexie';
import { Usuario } from '../models/Usuario';
import { Cliente } from '../models/Cliente';
import { Servico } from '../models/Servico';
import { Agendamento } from '../models/Agendamento';

export class AppDB extends Dexie {
  usuarios!: Table<Usuario, number>;
  clientes!: Table<Cliente, number>;
  servicos!: Table<Servico, number>;
  agendamentos!: Table<Agendamento, number>;

  constructor() {
    super('NoteBarberDB');

    this.version(1).stores({
      usuarios: '++id, nome',
      clientes: '++id, nome, telefone',
      servicos: '++id, nome, duracaoMinutos',
      agendamentos: '++id, clienteId, dataHora, status'
    });
  }
}

export const db = new AppDB();
