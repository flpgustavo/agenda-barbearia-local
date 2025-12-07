import { Database } from './index'; // Importa apenas o TIPO, não a variável db

// Função auxiliar segura para gerar UUID
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback simples caso o crypto não esteja disponível
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function seedDatabase(db: Database) {
  try {
    // Verificação de segurança: Se já tem serviços, não faz nada
    const count = await db.servicos.count();
    if (count > 0) return;

    console.log('🌱 Banco vazio detectado. Inserindo dados iniciais...');

    const now = new Date();

    // Dados
    const servicos = [
      { id: generateUUID(), nome: 'Corte Degradê', duracaoMinutos: 45, preco: 40.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Barba Completa', duracaoMinutos: 30, preco: 30.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Combo (Corte + Barba)', duracaoMinutos: 60, preco: 60.00, createdAt: now, updatedAt: now }
    ];

    const usuarios = [
      { id: generateUUID(), nome: 'Mestre Barbeiro', inicio: '09:00', fim: '19:00', intervaloInicio: '12:00', intervaloFim: '13:00', createdAt: now, updatedAt: now }
    ];

    const clientes = [
      { id: generateUUID(), nome: 'Carlos Cliente', telefone: '4488048244', createdAt: now, updatedAt: now }
    ];

    // Inserção
    await db.transaction('rw', db.servicos, db.usuarios, db.clientes, async () => {
      await db.servicos.bulkAdd(servicos as any);
      await db.usuarios.bulkAdd(usuarios as any);
      await db.clientes.bulkAdd(clientes as any);
    });

    console.log('✅ Seeder finalizado com sucesso!');
  } catch (error) {
    console.error('Erro no seeder:', error);
  }
}