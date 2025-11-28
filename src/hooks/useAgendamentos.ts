import { useEffect, useState } from 'react';
import { Agendamento } from '../core/models/Agendamento';
import { AgendamentoService } from '../core/services/AgendamentoService';

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await AgendamentoService.list();
      setAgendamentos(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }

  async function create(ag: Omit<Agendamento, 'id'>) {
    await AgendamentoService.create(ag);
    await load();
  }

  async function update(id: number, patch: Partial<Agendamento>) {
    await AgendamentoService.update(id, patch);
    await load();
  }

  async function remove(id: number) {
    await AgendamentoService.remove(id);
    await load();
  }

  async function listByDate(dateISO: string) {
    return AgendamentoService.listByDate(dateISO);
  }

  async function updateStatus(id: number, status: Agendamento['status']) {
    await AgendamentoService.updateStatus(id, status);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { agendamentos, loading, error, load, create, update, remove, listByDate, updateStatus };
}
