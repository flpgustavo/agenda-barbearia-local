import { useEffect, useState } from 'react';
import { Usuario } from '../core/models/Usuario';
import { UsuarioService } from '../core/services/UsuarioService';

export function useUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await UsuarioService.list();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function create(user: Omit<Usuario, 'id'>) {
    await UsuarioService.create(user);
    await load();
  }

  async function update(id: string, patch: Partial<Usuario>) {
    await UsuarioService.update(id, patch);
    await load();
  }

  async function remove(id: string) {
    await UsuarioService.remove(id);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return { usuarios, loading, error, load, create, update, remove };
}
