import { Usuario } from '../models/Usuario';
import { BaseService } from './BaseService';

class UsuarioServiceClass extends BaseService<Usuario> {
    constructor() {
        super('usuarios');
    }

}

export const UsuarioService = new UsuarioServiceClass();