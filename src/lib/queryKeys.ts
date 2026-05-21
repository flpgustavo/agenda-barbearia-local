export const queryKeys = {
  clientes: ['clientes'] as const,
  servicos: ['servicos'] as const,
  usuarios: ['usuarios'] as const,
  transacoes: ['transacoes'] as const,
  agendamentos: ['agendamentos'] as const,
  agendamentosDetalhes: ['agendamentos', 'detalhes'] as const,
  agendamentoDetalhe: (id: string) => ['agendamentos', 'detalhe', id] as const,
  gradeDisponibilidade: ['gradeDisponibilidade'] as const,
};
