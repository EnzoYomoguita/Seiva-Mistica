import { cpfValido } from './cpf.util';
import { Usuario } from './usuario.model';

export function erroUsuario(usuario: Usuario): string {
  const nome = usuario.nome.trim();
  const email = usuario.email.trim();
  if (nome.length < 3 || nome.length > 80) return 'O nome deve ter entre 3 e 80 caracteres.';
  if (!cpfValido(usuario.cpf)) return 'CPF inválido. Confira os 11 dígitos.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) return 'Informe um e-mail válido com até 254 caracteres.';
  const tamanho = usuario.senha?.length ?? 0;
  if (tamanho < 6 || tamanho > 64) return 'A senha deve ter entre 6 e 64 caracteres.';
  if (typeof usuario.admin !== 'boolean') return 'Selecione Cliente ou Administrador.';
  return '';
}
