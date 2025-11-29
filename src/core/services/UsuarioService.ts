import { BaseService } from "./BaseService";
import { Usuario } from "../models/Usuario";

class UsuarioServiceClass extends BaseService<Usuario> {
    constructor() {
        super('usuarios');
    }

    // Padroniza hora para "HH:MM"
    private normalizarHora(hora: string) {
        const [h, m] = hora.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    }

   private validarHorarios(usuario: Omit<Usuario, "id" | "createdAt" | "updatedAt">) {

    const inicio = this.toMinutes(usuario.inicio);
    const fim = this.toMinutes(usuario.fim);
    const intervaloInicio = this.toMinutes(usuario.intervaloInicio);
    const intervaloFim = this.toMinutes(usuario.intervaloFim);

    if (inicio >= fim) {
        throw new Error("Horário de início deve ser antes do horário de fim.");
    }

    if (intervaloInicio >= intervaloFim) {
        throw new Error("Intervalo de início deve ser antes do intervalo de fim.");
    }

    if (intervaloInicio < inicio || intervaloFim > fim) {
        throw new Error("O intervalo deve estar dentro do horário de trabalho.");
    }
}
    toMinutes(inicio: string) {
        throw new Error("Method not implemented.");
    }


    // ⚠️ Apenas um usuário permitido
    private async validarDuplicidade() {
        const total = await this.table.count();
        if (total > 0) {
            throw new Error("Já existe um usuário cadastrado.");
        }
    }

    async create(data: Omit<Usuario, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            await this.validarHorarios(data);
            await this.validarDuplicidade();

            return super.create(data);
        } catch (err) {
            throw err;
        }
    }
}

export const UsuarioService = new UsuarioServiceClass();
