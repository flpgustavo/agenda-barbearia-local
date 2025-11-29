import { BaseModel } from "./BaseModel";

export interface Usuario extends BaseModel {
    nome: string;
    inicio: string;
    fim: string;
    intervaloInicio: string;
    intervaloFim: string;
}
