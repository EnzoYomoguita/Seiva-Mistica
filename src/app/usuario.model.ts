export interface Usuario {
  id?: number | string;
  admin?: boolean;
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  preferencias?: string[];
}
