import { db } from '../db';
import { Agendamento } from '../models/Agendamento';
import { Servico } from '../models/Servico';

/**
 * Serviços expostos:
 * - list(): todos os agendamentos
 * - listByDate(dateISO): agendamentos do dia
 * - get(id)
 * - create(Agendamento sem id) -> adiciona id automaticamente
 * - update(id, patch)
 * - remove(id)
 * - updateStatus(id, status)
 *
 * Regras:
 * - Verificar conflito ao criar (sobreposição real considerando duração dos serviços)
 */

export const AgendamentoService = {
  async list(): Promise<Agendamento[]> {
    return db.agendamentos.orderBy('dataHora').toArray();
  },

  async listByDate(dateISO: string): Promise<Agendamento[]> {
    const inicio = dateISO + 'T00:00:00';
    const fim = dateISO + 'T23:59:59';
    return db.agendamentos
      .filter(a => a.dataHora >= inicio && a.dataHora <= fim)
      .toArray();
  },

  async get(id: number): Promise<Agendamento | undefined> {
    return db.agendamentos.get(id);
  },

  async create(data: Omit<Agendamento, 'id'>): Promise<number> {
    const conflito = await this.hasConflict(data.dataHora, data.servicosId);
    if (conflito) throw new Error('Horário em conflito com outro agendamento.');
    return db.agendamentos.add(data as Agendamento);
  },

  async update(id: number, patch: Partial<Agendamento>): Promise<number | undefined> {
    await db.agendamentos.update(id, patch);
    return id;
  },

  async remove(id: number): Promise<void> {
    await db.agendamentos.delete(id);
  },

  async updateStatus(id: number, status: Agendamento['status']): Promise<number | undefined> {
    await db.agendamentos.update(id, { status });
    return id;
  },

  /**
   * Verifica conflito real considerando duração dos serviços (minutos).
   * dataHora: ISO string de início (ex: 2025-11-30T10:00:00.000Z ou sem Z local)
   * servicosIds: ids dos serviços que compõe o novo agendamento
   */
  async hasConflict(dataHora: string, servicosIds: number[]): Promise<boolean> {
    const servicos: Servico[] = await db.servicos.where('id').anyOf(servicosIds).toArray();
    const duracoes = servicos.reduce((acc, s) => acc + (s.duracaoMinutos || 0), 0);

    const inicioNovo = new Date(dataHora);
    const fimNovo = new Date(inicioNovo.getTime() + duracoes * 60_000);

    // percorre todos os agendamentos existentes e calcula duração de cada
    const todos = await db.agendamentos.toArray();
    for (const ag of todos) {
      const inicioAg = new Date(ag.dataHora);
      const servsAg: Servico[] = await db.servicos.where('id').anyOf(ag.servicosId).toArray();
      const durAg = servsAg.reduce((acc, s) => acc + (s.duracaoMinutos || 0), 0);
      const fimAg = new Date(inicioAg.getTime() + durAg * 60_000);

      const sobrepoe =
        (inicioNovo >= inicioAg && inicioNovo < fimAg) ||
        (fimNovo > inicioAg && fimNovo <= fimAg) ||
        (inicioAg >= inicioNovo && inicioAg < fimNovo);

      if (sobrepoe) return true;
    }

    return false;
  }
};
