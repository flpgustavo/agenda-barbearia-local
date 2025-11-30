import { BaseService } from "./BaseService";
import { Usuario } from "../models/Usuario";
import { db } from "../db";

class UsuarioServiceClass extends BaseService<Usuario> {
    constructor() {
        super("usuarios");
    }

    private toMinutes(hora: string): number {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
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

    private async validarDuplicidade() {
        const total = await this.table.count();
        if (total > 0) {
            throw new Error("Já existe um usuário cadastrado.");
        }
    }

    async create(data: Omit<Usuario, "id" | "createdAt" | "updatedAt">): Promise<string> {

        this.validarHorarios(data);

        await this.validarDuplicidade();

        return super.create(data);
    }

    async update(id: string, data: Partial<Usuario>) {
        const atual = await this.table.get(id);
        if (!atual) throw new Error("Usuário não encontrado.");

        const combinado = { ...atual, ...data };

        this.validarHorarios(combinado);

        return super.update(id, data);
    }
}

export const UsuarioService = new UsuarioServiceClass();
