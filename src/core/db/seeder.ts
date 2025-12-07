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
      { id: generateUUID(), nome: 'Combo (Corte + Barba)', duracaoMinutos: 60, preco: 60.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Corte de Barba', duracaoMinutos: 30, preco: 30.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Corte de Bigode', duracaoMinutos: 45, preco: 40.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Corte de Costeleta', duracaoMinutos: 30, preco: 30.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Corte de Barba com Desenho', duracaoMinutos: 60, preco: 60.00, createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Corte de Barba com Pintura', duracaoMinutos: 60, preco: 60.00, createdAt: now, updatedAt: now }
    ];

    const usuarios = [
      { id: generateUUID(), nome: 'Mestre Barbeiro', inicio: '09:00', fim: '19:00', intervaloInicio: '12:00', intervaloFim: '13:00', createdAt: now, updatedAt: now }
    ];

    const clientes = [
      { id: generateUUID(), nome: 'Carlos Cliente', telefone: '11999999999', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Amantino Pedro', telefone: '11988887777', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Pedro Santos', telefone: '11977776666', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'João Silva', telefone: '11966665555', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Lucas Pereira', telefone: '11955554444', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Mateus Oliveira', telefone: '11944443333', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Rafael Costa', telefone: '11933332222', createdAt: now, updatedAt: now },
      { id: generateUUID(), nome: 'Gustavo Rodrigues', telefone: '11922221111', createdAt: now, updatedAt: now }


    ];

    const agendamentos = [
      { id: generateUUID(), clienteId: clientes[0].id, servicoId: servicos[0].id, dataHora: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0), criadoPor: usuarios[0].id, createdAt: now, updatedAt: now },
      { id: generateUUID(), clienteId: clientes[1].id, servicoId: servicos[1].id, dataHora: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0), criadoPor: usuarios[0].id, createdAt: now, updatedAt: now },
      { id: generateUUID(), clienteId: clientes[2].id, servicoId: servicos[2].id, dataHora: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0), criadoPor: usuarios[0].id, createdAt: now, updatedAt: now },
      { id: generateUUID(), clienteId: clientes[3].id, servicoId: servicos[0].id, dataHora: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0), criadoPor: usuarios[0].id, createdAt: now, updatedAt: now },
      { id: generateUUID(), clienteId: clientes[4].id, servicoId: servicos[1].id, dataHora: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0), criadoPor: usuarios[0].id, createdAt: now, updatedAt: now }
    ]
    // Inserção
    await db.transaction('rw', db.servicos, db.usuarios, db.clientes, db.agendamentos, async () => {
      await db.servicos.bulkAdd(servicos as any);
      await db.usuarios.bulkAdd(usuarios as any);
      await db.clientes.bulkAdd(clientes as any);
      await db.agendamentos.bulkAdd(agendamentos as any);
    });

    console.log('✅ Seeder finalizado com sucesso!');
  } catch (error) {
    console.error('Erro no seeder:', error);
  }
}