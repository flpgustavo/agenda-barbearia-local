'use client'

// --- Types ---
export interface TourStep {
  id: string
  title: string
  content: string
  targetSelector: string
  pageUrl: string
  action?: 'click' | 'form' | 'success'
}

// --- Steps definition ---
export const tourSteps: TourStep[] = [
  {
    id: 'cliente',
    title: 'Crie seu primeiro cliente',
    content: 'Adicione clientes para agendar serviços',
    targetSelector: '[data-tour="add-cliente"]',
    pageUrl: '/clientes',
    action: 'form',
  },
  {
    id: 'servico',
    title: 'Defina seus serviços',
    content: 'Cadastre os serviços oferecidos',
    targetSelector: '[data-tour="add-servico"]',
    pageUrl: '/servicos',
    action: 'form',
  },
  {
    id: 'agendamento',
    title: 'Primeiro agendamento',
    content: 'Agende um horário para um cliente',
    targetSelector: '[data-tour="add-agendamento"]',
    pageUrl: '/agendamentos',
    action: 'form',
  },
  {
    id: 'concluir',
    title: 'Conclua o atendimento',
    content: 'Marque como atendido para criar transação',
    targetSelector: '[data-tour="concluir-agendamento"]',
    pageUrl: '/agendamentos',
    action: 'click',
  },
  {
    id: 'transacao',
    title: 'Registre o pagamento',
    content: 'Registre a receita do serviço',
    targetSelector: '[data-tour="add-transacao"]',
    pageUrl: '/transacoes',
    action: 'form',
  },
]
