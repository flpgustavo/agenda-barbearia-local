import { BaseModel } from "./BaseModel";

export interface Cliente extends BaseModel {
    nome: string;
    telefone?: string;
}
