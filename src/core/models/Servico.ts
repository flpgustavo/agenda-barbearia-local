import { BaseModel } from "./BaseModel";

export interface Servico extends BaseModel {
    nome: string;
    duracaoMinutos: number;
    preco?: number;
}
