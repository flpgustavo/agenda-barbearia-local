import { Database } from './index';

// Função auxiliar segura para gerar UUID
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Auxiliares de data para facilitar a leitura
const hoje = new Date();
const diasAtras = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
};
const mesesAtras = (meses: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d;
};

// Gera data aleatória dentro de um intervalo (para espalhar nos dias da semana)
const dataAleatoriaEntre = (inicio: Date, fim: Date, horaFixa?: number) => {
  const diff = fim.getTime() - inicio.getTime();
  const novaData = new Date(inicio.getTime() + Math.random() * diff);
  if (horaFixa) novaData.setHours(horaFixa, 0, 0, 0);
  return novaData;
};

export async function seedDatabase(db: Database) {
  try {
    const count = await db.servicos.count();
    if (count > 0) return;

    console.log('🌱 Banco vazio detectado. Gerando dados complexos para Dashboard...');

    // 1. SERVIÇOS
    const servicos = [
      { id: 'srv-1', nome: 'Corte Degradê', duracaoMinutos: 45, preco: 40.00 },
      { id: 'srv-2', nome: 'Barba Completa', duracaoMinutos: 30, preco: 30.00 },
      { id: 'srv-3', nome: 'Combo (Corte + Barba)', duracaoMinutos: 60, preco: 65.00 }, // Preço quebrado para variar ticket
      { id: 'srv-4', nome: 'Pezinho / Acabamento', duracaoMinutos: 15, preco: 15.00 },
      { id: 'srv-5', nome: 'Platinado', duracaoMinutos: 120, preco: 150.00 }, // Ticket alto
    ].map(s => ({ ...s, createdAt: diasAtras(200), updatedAt: diasAtras(200) }));

    // 2. USUÁRIOS
    const usuarios = [
      { id: 'usr-1', nome: 'Mestre Barbeiro', inicio: '09:00', fim: '19:00', intervaloInicio: '12:00', intervaloFim: '13:00', createdAt: diasAtras(365), updatedAt: diasAtras(365) }
    ];

    // 3. CLIENTES (Perfis estratégicos para os gráficos)
    const clientesBase = [
      { id: 'cli-vip', nome: 'Carlos VIP (O Fiel)', telefone: '11999990001', createdAt: diasAtras(365) }, // Vai ter muitas visitas
      { id: 'cli-mensal', nome: 'João Mensalista', telefone: '11999990002', createdAt: diasAtras(180) }, // Visita a cada 30 dias
      { id: 'cli-sumido', nome: 'Pedro Sumido', telefone: '11999990003', createdAt: diasAtras(200) }, // Veio uma vez e sumiu
      { id: 'cli-recente', nome: 'Lucas Novato', telefone: '11999990004', createdAt: diasAtras(5) }, // Primeira visita semana passada
      { id: 'cli-semanal', nome: 'Marcos Semanal', telefone: '11999990005', createdAt: diasAtras(60) }, // Corta toda semana
      { id: 'cli-cancelador', nome: 'Felipe Indeciso', telefone: '11999990006', createdAt: diasAtras(30) }, // Só cancela
    ].map(c => ({ ...c, updatedAt: c.createdAt }));

    // 4. AGENDAMENTOS (Gerando histórico)
    let agendamentos: any[] = [];

    // === CENÁRIO 1: O Cliente VIP (Gera "Top Clientes" e "Lifetime: Leais") ===
    // Vem a cada 15 dias no último ano
    for (let i = 0; i < 20; i++) {
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-vip',
        servicoId: i % 2 === 0 ? 'srv-3' : 'srv-5', // Alterna entre Combo e Platinado ($$)
        dataHora: diasAtras(i * 15).toISOString(), // 0, 15, 30, 45 dias atrás...
        status: 'CONCLUIDO',
        criadoPor: 'usr-1',
        createdAt: diasAtras(i * 15),
        updatedAt: diasAtras(i * 15)
      });
    }

    // === CENÁRIO 2: O Cliente Mensalista (Gera "Frequência: Mensal") ===
    for (let i = 0; i < 6; i++) {
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-mensal',
        servicoId: 'srv-1',
        dataHora: diasAtras(i * 30 + 2).toISOString(), // +2 para variar o dia da semana
        status: 'CONCLUIDO',
        criadoPor: 'usr-1',
        createdAt: diasAtras(i * 30),
        updatedAt: diasAtras(i * 30)
      });
    }

    // === CENÁRIO 3: O Cliente Semanal (Gera "Frequência: Semanal" e preenche "Dias da Semana") ===
    for (let i = 0; i < 8; i++) {
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-semanal',
        servicoId: 'srv-4', // Pezinho
        dataHora: diasAtras(i * 7).toISOString(),
        status: 'CONCLUIDO',
        criadoPor: 'usr-1',
        createdAt: diasAtras(i * 7),
        updatedAt: diasAtras(i * 7)
      });
    }

    // === CENÁRIO 4: O Cliente Sumido (Gera "Lifetime: Em Teste/Novatos") ===
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-sumido',
      servicoId: 'srv-2',
      dataHora: diasAtras(190).toISOString(),
      status: 'CONCLUIDO',
      criadoPor: 'usr-1',
      createdAt: diasAtras(190),
      updatedAt: diasAtras(190)
    });

    // === CENÁRIO 5: O Novato (Gera "Lifetime: Novato") ===
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-recente',
      servicoId: 'srv-1',
      dataHora: diasAtras(2).toISOString(),
      status: 'CONCLUIDO',
      criadoPor: 'usr-1',
      createdAt: diasAtras(2),
      updatedAt: diasAtras(2)
    });

    // === CENÁRIO 6: Cancelamentos e Futuros (Não conta para receita, testa filtros) ===
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-cancelador',
      servicoId: 'srv-5',
      dataHora: diasAtras(10).toISOString(),
      status: 'CANCELADO',
      criadoPor: 'usr-1',
      createdAt: diasAtras(15),
      updatedAt: diasAtras(10)
    });

    // Agendamento futuro (para ver se aparece na lista mas não atrapalha métricas passadas)
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-vip',
      servicoId: 'srv-1',
      dataHora: new Date(hoje.getTime() + 86400000 * 2).toISOString(), // Daqui 2 dias
      status: 'AGENDADO',
      criadoPor: 'usr-1',
      createdAt: hoje,
      updatedAt: hoje
    });

    // === CENÁRIO 7: Volume Aleatório (Para preencher o gráfico de Receita por Dia da Semana) ===
    // Gera 50 agendamentos aleatórios nos últimos 3 meses para garantir dados em Seg, Ter, Qua...
    for (let i = 0; i < 50; i++) {
      const dataRandom = dataAleatoriaEntre(mesesAtras(3), hoje);
      // Pega um serviço aleatório
      const srvRandom = servicos[Math.floor(Math.random() * servicos.length)];
      // Pega um cliente aleatório (menos o cancelador)
      const cliRandom = clientesBase[Math.floor(Math.random() * (clientesBase.length - 1))];
      
      agendamentos.push({
        id: generateUUID(),
        clienteId: cliRandom.id,
        servicoId: srvRandom.id,
        dataHora: dataRandom.toISOString(),
        status: 'CONCLUIDO',
        criadoPor: 'usr-1',
        createdAt: dataRandom,
        updatedAt: dataRandom
      });
    }

    // Transação de Inserção
    await db.transaction('rw', db.servicos, db.usuarios, db.clientes, db.agendamentos, async () => {
      await db.servicos.bulkAdd(servicos as any);
      await db.usuarios.bulkAdd(usuarios as any);
      await db.clientes.bulkAdd(clientesBase as any);
      await db.agendamentos.bulkAdd(agendamentos as any);
    });

    console.log(`✅ Seeder finalizado! Inseridos: ${agendamentos.length} agendamentos, ${clientesBase.length} clientes.`);
  } catch (error) {
    console.error('Erro no seeder:', error);
  }
}