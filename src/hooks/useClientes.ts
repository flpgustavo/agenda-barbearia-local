import { useEffect, useState } from 'react';
import { Cliente } from '../core/models/Cliente';
import { ClienteService } from '../core/services/ClienteService';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await new ClienteService().list();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  async function create(cliente: Omit<Cliente, 'id'>) {
    await new ClienteService().create(cliente);
    await load();
  }

  async function update(id: string, patch: Partial<Cliente>) {
    await new ClienteService().update(id, patch);
    await load();
  }

  async function remove(id: string) {
    await new ClienteService().delete(id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { clientes, loading, error, load, create, update, remove};
}
