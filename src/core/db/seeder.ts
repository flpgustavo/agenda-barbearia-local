import { Database } from './index';
import { Servico } from "../models/Servico";
import { Cliente } from "../models/Cliente";
import { Agendamento } from "../models/Agendamento";
import { Transacao } from "../models/Transacao";

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── Date Helpers ──────────────────────────────────────────────────────────────

/** ISO date string `dias` days ago, with optional hour/minute. */
const dataDiasAtras = (dias: number, hora?: number, minuto?: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  if (hora !== undefined) d.setHours(hora, minuto ?? 0, 0, 0);
  return d.toISOString();
};

/** ISO date string `meses` months ago. */
const dataMesesAtras = (meses: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.toISOString();
};

/** Realistic appointment ISO date in [diasAtrasMin, diasAtrasMax] range,
 *  on a weekday (Mon-Sat) at 8-11 or 14-17. */
const gerarDataRealistica = (diasAtrasMin: number, diasAtrasMax: number): string => {
  const dias = diasAtrasMin + Math.floor(Math.random() * (diasAtrasMax - diasAtrasMin + 1));
  const d = new Date();
  d.setDate(d.getDate() - dias);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // skip Sunday
  const hora = Math.random() < 0.5
    ? 8 + Math.floor(Math.random() * 4)   // 8-11
    : 14 + Math.floor(Math.random() * 4);  // 14-17
  d.setHours(hora, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

/** Future ISO date `diasFrente` days from now, on a weekday, at `hora`. */
const dataFutura = (diasFrente: number, hora: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + diasFrente);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  d.setHours(hora, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

// ── Seed Function ─────────────────────────────────────────────────────────────

export async function seedDatabase(db: Database) {
  try {
    const count = await db.servicos.count();
    if (count > 0) {
      console.log('ℹ️  Banco já possui dados. Seeder ignorado.');
      return;
    }

    const usuarioCount = await db.usuarios.count();
    if (usuarioCount === 0) {
      console.log('ℹ️  Nenhum usuário cadastrado. Seeder ignorado.');
      return;
    }

    console.log('🌱  Banco vazio detectado. Gerando dados de demonstração...');

    // ── Servicos (5) ──────────────────────────────────────────────────────────
    const servicos: Servico[] = [
      { id: 'srv-1', nome: 'Corte Degradê', duracaoMinutos: 45, preco: 40.00, createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
      { id: 'srv-2', nome: 'Barba Completa', duracaoMinutos: 30, preco: 30.00, createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
      { id: 'srv-3', nome: 'Combo (Corte + Barba)', duracaoMinutos: 60, preco: 65.00, createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
      { id: 'srv-4', nome: 'Pezinho / Acabamento', duracaoMinutos: 15, preco: 15.00, createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
      { id: 'srv-5', nome: 'Platinado', duracaoMinutos: 120, preco: 150.00, createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
    ];

    // Build preço lookup for transacoes
    const servicoPreco: Record<string, number> = {};
    for (const s of servicos) {
      if (s.id) servicoPreco[s.id] = s.preco ?? 0;
    }

    // ── Clientes (6) ──────────────────────────────────────────────────────────
    const clientes: Cliente[] = [
      { id: 'cli-vip', nome: 'Carlos VIP (O Fiel)', telefone: '11999990001', createdAt: dataMesesAtras(12), updatedAt: dataMesesAtras(12) },
      { id: 'cli-mensal', nome: 'João Mensalista', telefone: '11999990002', createdAt: dataMesesAtras(6), updatedAt: dataMesesAtras(6) },
      { id: 'cli-sumido', nome: 'Pedro Sumido', telefone: '11999990003', createdAt: dataMesesAtras(7), updatedAt: dataMesesAtras(7) },
      { id: 'cli-recente', nome: 'Lucas Novato', telefone: '11999990004', createdAt: dataDiasAtras(5), updatedAt: dataDiasAtras(5) },
      { id: 'cli-semanal', nome: 'Marcos Semanal', telefone: '11999990005', createdAt: dataMesesAtras(2), updatedAt: dataMesesAtras(2) },
      { id: 'cli-cancelador', nome: 'Felipe Indeciso', telefone: '11999990006', createdAt: dataDiasAtras(30), updatedAt: dataDiasAtras(30) },
    ];

    // ── Agendamentos ──────────────────────────────────────────────────────────
    const agendamentos: Agendamento[] = [];

    // -- CONCLUIDO: VIP client (15 visits spread over ~12 months) --
    for (let i = 0; i < 15; i++) {
      const diasAtrasVal = Math.floor(i * (365 / 15)) + Math.floor(Math.random() * 5);
      const servicoId = i % 3 === 0 ? 'srv-5' : (i % 3 === 1 ? 'srv-3' : 'srv-1');
      const dataHora = gerarDataRealistica(diasAtrasVal + 5, diasAtrasVal + 10);
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-vip',
        servicoId,
        dataHora,
        status: 'CONCLUIDO',
        createdAt: dataHora,
        updatedAt: dataHora,
      });
    }

    // -- CONCLUIDO: Mensalista (5 monthly visits) --
    for (let i = 0; i < 5; i++) {
      const diasAtrasVal = i * 30 + 2 + Math.floor(Math.random() * 5);
      const dataHora = gerarDataRealistica(diasAtrasVal, diasAtrasVal + 3);
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-mensal',
        servicoId: 'srv-1',
        dataHora,
        status: 'CONCLUIDO',
        createdAt: dataHora,
        updatedAt: dataHora,
      });
    }

    // -- CONCLUIDO: Semanal (8 weekly visits with Pezinho) --
    for (let i = 0; i < 8; i++) {
      const diasAtrasVal = i * 7 + 2 + Math.floor(Math.random() * 2);
      const dataHora = gerarDataRealistica(diasAtrasVal, diasAtrasVal + 2);
      agendamentos.push({
        id: generateUUID(),
        clienteId: 'cli-semanal',
        servicoId: 'srv-4',
        dataHora,
        status: 'CONCLUIDO',
        createdAt: dataHora,
        updatedAt: dataHora,
      });
    }

    // -- CONCLUIDO: Sumido (1 visit ~190 days ago) --
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-sumido',
      servicoId: 'srv-2',
      dataHora: gerarDataRealistica(190, 195),
      status: 'CONCLUIDO',
      createdAt: dataDiasAtras(190),
      updatedAt: dataDiasAtras(190),
    });

    // -- CONCLUIDO: Recente (2 visits a few days ago) --
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-recente',
      servicoId: 'srv-1',
      dataHora: gerarDataRealistica(2, 4),
      status: 'CONCLUIDO',
      createdAt: dataDiasAtras(5),
      updatedAt: dataDiasAtras(5),
    });
    agendamentos.push({
      id: generateUUID(),
      clienteId: 'cli-recente',
      servicoId: 'srv-2',
      dataHora: gerarDataRealistica(5, 7),
      status: 'CONCLUIDO',
      createdAt: dataDiasAtras(5),
      updatedAt: dataDiasAtras(5),
    });

    // -- CONCLUIDO: Random (20 appointments across clients, last 3 months) --
    const randomClients = ['cli-vip', 'cli-mensal', 'cli-semanal', 'cli-recente'];
    for (let i = 0; i < 20; i++) {
      const servicoId = servicos[Math.floor(Math.random() * servicos.length)].id!;
      const clienteId = randomClients[Math.floor(Math.random() * randomClients.length)];
      const dataHora = gerarDataRealistica(0, 90);
      agendamentos.push({
        id: generateUUID(),
        clienteId,
        servicoId,
        dataHora,
        status: 'CONCLUIDO',
        observacoes: i % 10 === 0 ? 'Cliente satisfeito, agendou próximo corte' : undefined,
        createdAt: dataHora,
        updatedAt: dataHora,
      });
    }

    // -- CONFIRMADO: Future appointments (7, 5-15 days ahead) --
    const confirmados: Array<{ clienteId: string; servicoId: string; dias: number; hora: number; obs?: string }> = [
      { clienteId: 'cli-vip', servicoId: 'srv-3', dias: 5, hora: 9 },
      { clienteId: 'cli-semanal', servicoId: 'srv-4', dias: 7, hora: 10 },
      { clienteId: 'cli-mensal', servicoId: 'srv-1', dias: 10, hora: 14 },
      { clienteId: 'cli-recente', servicoId: 'srv-1', dias: 12, hora: 15 },
      { clienteId: 'cli-vip', servicoId: 'srv-5', dias: 8, hora: 16, obs: 'Cliente prefere cadeira perto da janela' },
      { clienteId: 'cli-cancelador', servicoId: 'srv-2', dias: 6, hora: 11 },
      { clienteId: 'cli-semanal', servicoId: 'srv-4', dias: 14, hora: 8 },
    ];

    for (const c of confirmados) {
      const dataHora = dataFutura(c.dias, c.hora);
      agendamentos.push({
        id: generateUUID(),
        clienteId: c.clienteId,
        servicoId: c.servicoId,
        dataHora,
        status: 'CONFIRMADO',
        observacoes: c.obs,
        createdAt: dataDiasAtras(0),
        updatedAt: dataDiasAtras(0),
      });
    }

    // -- CANCELADO: Past and future cancellations (4) --
    const cancelados: Array<{ clienteId: string; servicoId: string; diasAtras?: number; diasFrente?: number; obs: string }> = [
      { clienteId: 'cli-cancelador', servicoId: 'srv-1', diasAtras: 15, obs: 'Cliente não compareceu' },
      { clienteId: 'cli-cancelador', servicoId: 'srv-2', diasAtras: 45, obs: 'Chuva forte' },
      { clienteId: 'cli-cancelador', servicoId: 'srv-3', diasAtras: 60, obs: 'Cliente viajou' },
      { clienteId: 'cli-cancelador', servicoId: 'srv-1', diasFrente: 3, obs: 'Cancelado pelo cliente' },
    ];

    for (const c of cancelados) {
      const dataHora = c.diasFrente !== undefined
        ? dataFutura(c.diasFrente, 10)
        : gerarDataRealistica(c.diasAtras!, c.diasAtras! + 2);
      agendamentos.push({
        id: generateUUID(),
        clienteId: c.clienteId,
        servicoId: c.servicoId,
        dataHora,
        status: 'CANCELADO',
        observacoes: c.obs,
        createdAt: dataHora,
        updatedAt: dataHora,
      });
    }

    // ── Transacoes ────────────────────────────────────────────────────────────
    const transacoes: Transacao[] = [];

    // ENTRADA: one per CONCLUIDO agendamento, valor = servico.preco
    for (const ag of agendamentos) {
      if (ag.status !== 'CONCLUIDO') continue;
      transacoes.push({
        id: generateUUID(),
        agendamentoId: ag.id,
        dataHora: ag.dataHora,
        tipo: 'ENTRADA',
        status: 'CONCLUIDO',
        valor: servicoPreco[ag.servicoId],
        createdAt: ag.dataHora,
        updatedAt: ag.dataHora,
      });
    }

    // SAIDA: independent expense transactions (no agendamentoId)
    const saidas: Array<{ valor: number; observacoes: string; diasAtras: number }> = [
      { valor: 1200.00, observacoes: 'Aluguel do salão', diasAtras: 25 },
      { valor: 180.00, observacoes: 'Conta de luz', diasAtras: 18 },
      { valor: 250.00, observacoes: 'Produtos de barbearia', diasAtras: 10 },
      { valor: 90.00, observacoes: 'Água', diasAtras: 22 },
      { valor: 45.00, observacoes: 'Material de limpeza', diasAtras: 5 },
    ];

    for (const s of saidas) {
      transacoes.push({
        id: generateUUID(),
        dataHora: dataDiasAtras(s.diasAtras, 10, 0),
        tipo: 'SAIDA',
        status: 'CONCLUIDO',
        valor: s.valor,
        observacoes: s.observacoes,
        createdAt: dataDiasAtras(s.diasAtras),
        updatedAt: dataDiasAtras(s.diasAtras),
      });
    }

    // ── Dexie Transaction ────────────────────────────────────────────────────
    await db.transaction('rw', [db.servicos, db.usuarios, db.clientes, db.agendamentos, db.transacoes], async () => {
      await db.servicos.bulkAdd(servicos);
      await db.clientes.bulkAdd(clientes);
      await db.agendamentos.bulkAdd(agendamentos);
      await db.transacoes.bulkAdd(transacoes);
    });

    // ── Summary ───────────────────────────────────────────────────────────────
    const concluidos = agendamentos.filter(a => a.status === 'CONCLUIDO').length;
    const confirmadosCount = agendamentos.filter(a => a.status === 'CONFIRMADO').length;
    const canceladosCount = agendamentos.filter(a => a.status === 'CANCELADO').length;
    const entradas = transacoes.filter(t => t.tipo === 'ENTRADA').length;
    const saidasCount = transacoes.filter(t => t.tipo === 'SAIDA').length;

    console.log(`✅  Seeder concluído!`);
    console.log(`    Serviços: ${servicos.length}`);
    console.log(`    Clientes: ${clientes.length}`);
    console.log(`    Agendamentos: ${agendamentos.length} (${concluidos} concluídos, ${confirmadosCount} confirmados, ${canceladosCount} cancelados)`);
    console.log(`    Transações: ${transacoes.length} (${entradas} entradas, ${saidasCount} saídas)`);
  } catch (error) {
    console.error('❌  Erro no seeder:', error);
  }
}
