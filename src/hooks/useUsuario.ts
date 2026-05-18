import { useBase } from "./useBase";
import { usuarioService } from "../core/services/UsuarioService";
import { Usuario } from "../core/models/Usuario";
import { queryKeys } from "../lib/queryKeys";

export default function useUsuario() {
    return useBase<Usuario>(usuarioService, queryKeys.usuarios);
}
