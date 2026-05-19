/**
 * tourSteps.ts
 *
 * Configuração dos 5 passos do tour de boas-vindas.
 * Cada passo mapeia uma entidade que o usuário deve criar
 * para aprender a usar o aplicativo.
 *
 * Ordem dos passos (D-01):
 *   1. Criar Cliente    → /clientes
 *   2. Criar Serviço    → /servicos
 *   3. Criar Agendamento → /agendamentos
 *   4. Concluir Atendimento → /agendamentos
 *   5. Registrar Transação → /transacoes
 *
 * Cada passo possui:
 *   - stepIndex: índice sequencial (0–4)
 *   - pageUrl: URL da página onde o elemento-alvo está
 *   - targetSelector: seletor CSS (data-tour) que identifica
 *     o elemento na página
 *   - title: título exibido no tooltip
 *   - description: descrição exibida no tooltip
 */

import { TourStep } from "./types";

export const TOUR_STEPS: TourStep[] = [
  {
    stepIndex: 0,
    pageUrl: "/clientes",
    targetSelector: "[data-tour='step-1']",
    title: "Crie seu primeiro cliente",
    description:
      "Toque no botão + para abrir o formulário e cadastrar o nome e telefone de um cliente.",
  },
  {
    stepIndex: 1,
    pageUrl: "/servicos",
    targetSelector: "[data-tour='step-2']",
    title: "Adicione um serviço",
    description:
      "Cadastre os serviços que você oferece, como cortes de cabelo, barba e hidratação.",
  },
  {
    stepIndex: 2,
    pageUrl: "/agendamentos",
    targetSelector: "[data-tour='step-3']",
    title: "Crie um agendamento",
    description:
      'Toque em "Novo" para agendar um horário com o cliente e serviço que você acabou de criar.',
  },
  {
    stepIndex: 3,
    pageUrl: "/agendamentos",
    targetSelector: "[data-tour='step-4']",
    title: "Conclua o atendimento",
    description:
      "Deslize o card do agendamento para a esquerda para marcar como concluído. Finalize registrando o valor recebido pelo serviço prestado.",
  },
  {
    stepIndex: 4,
    pageUrl: "/transacoes",
    targetSelector: "[data-tour='step-5']",
    title: "Confira suas transações",
    description:
      "Cadastre despesas e receitas para acompanhar o fluxo de caixa do seu negócio. Toque no botão + para adicionar uma nova transação.",
  },
];
