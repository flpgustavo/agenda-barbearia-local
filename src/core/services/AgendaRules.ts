// Regras utilitárias para cálculo de horários disponíveis e conflitos.
// Funções puras que ajudam AgendamentoService e a UI a calcular opções.

import { Servico } from '../models/Servico';

/**
 * Converte "HH:MM" em minutos desde meia-noite.
 */
export function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Verifica se um horário (inicioA-fimA) sobrepõe outro (inicioB-fimB)
 * todos os parâmetros em minutos desde meia-noite ou timestamps em ms.
 */
export function overlapRanges(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

/**
 * Soma durações dos serviços (minutos).
 */
export function totalDuration(servicos: Servico[]) {
  return servicos.reduce((acc, s) => acc + (s.duracaoMinutos || 0), 0);
}
