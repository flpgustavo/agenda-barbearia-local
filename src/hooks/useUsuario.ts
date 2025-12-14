import { useBase } from "./useBase";
import { usuarioService } from "../core/services/UsuarioService";
import { Usuario } from "../core/models/Usuario";

export default function useUsuario() {
    return useBase<Usuario>(usuarioService);
}
