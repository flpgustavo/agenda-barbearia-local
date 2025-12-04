import { useBase } from "./useBase";
import { UsuarioService } from "../core/services/UsuarioService";
import { Usuario } from "../core/models/Usuario";

export default function useUsuario() {
    return useBase<Usuario>(UsuarioService);
}
