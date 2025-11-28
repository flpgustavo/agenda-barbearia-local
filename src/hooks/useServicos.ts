import { useEffect, useState } from 'react';
import { Servico } from '../core/models/Servico';
import { ServicoService } from '../core/services/ServicoService';

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await ServicoService.list();
      setServicos(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  }

  async function create(servico: Omit<Servico, 'id'>) {
    await ServicoService.create(servico);
    await load();
  }

  async function update(id: number, patch: Partial<Servico>) {
    await ServicoService.update(id, patch);
    await load();
  }

  async function remove(id: number) {
    await ServicoService.remove(id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { servicos, loading, error, load, create, update, remove };
}
