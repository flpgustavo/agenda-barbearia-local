export interface Usuario {
  id: number;
  nome: string;
  inicio: string;          // ex: "08:00"
  fim: string;             // ex: "18:00"
  intervaloInicio: string; // ex: "12:00"
  intervaloFim: string;    // ex: "13:00"
}
