import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { erroUsuario } from '../usuario-validacao';
import { Usuario } from '../usuario.model';

//a pagina anterior é como se fosse o gerenciador do adm, já essa é responsavel por alterar cadastos, adicionar cadastro e excluir cadastros
//ela faz a organização das operações, e faz toda essa validação na api para o banco de dados.
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = '/api/usuarios';
  //a outra pagina faz verificação e solicitação das funções ja esta pagina é resposanvel por executar todas as solicitações do adm

  constructor(private http: HttpClient, private auth: AuthService) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.api);
  }

  buscar(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.api}/${id}`);
  }

  cadastrarPeloAdministrador(usuario: Usuario): Observable<Usuario> {

    if (this.auth.atual?.admin !== true) {

      return throwError(() => new Error('Apenas administradores podem cadastrar usuários nesta tela.'));

    }

    const erro = erroUsuario(usuario);

    if (erro) return throwError(() => new Error(erro));

    const dados: Usuario = {

      nome: usuario.nome.trim(), cpf: usuario.cpf.replace(/\D/g, ''),

      email: usuario.email.trim().toLowerCase(), senha: usuario.senha,

      admin: usuario.admin === true, preferencias: [...(usuario.preferencias ?? [])]

    };

    return this.listar().pipe(switchMap(lista => {

      if (lista.some(u => u.cpf.replace(/\D/g, '') === dados.cpf)) {

        return throwError(() => new Error('CPF já cadastrado.'));

      }

      if (lista.some(u => u.email.trim().toLowerCase() === dados.email)) {

        return throwError(() => new Error('E-mail já cadastrado.'));

      }

      return this.criar(dados);

    }));

  }



  alterarPerfil(id: number | string, admin: boolean): Observable<Usuario> {
    const atual = this.auth.atual;
    if (atual?.admin !== true) return throwError(() => new Error('Apenas administradores podem alterar perfis.'));
    if (typeof admin !== 'boolean') return throwError(() => new Error('Perfil inválido.'));
    if (String(id) === String(atual.id)) return throwError(() => new Error('Você não pode alterar o próprio perfil nesta tela.'));
    return this.http.patch<Usuario>(`${this.api}/${encodeURIComponent(String(id))}`, { admin });
  }

  criar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.api, usuario);
  }

  atualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.api}/${id}`, usuario);
  }

  excluir(id: number | string): Observable<void> {
    const atual = this.auth.atual;
    if (atual?.admin !== true) return throwError(() => new Error('Apenas administradores podem excluir contas.'));
    if (String(id) === String(atual.id)) return throwError(() => new Error('Você não pode excluir a própria conta.'));
    return this.http.delete<void>(`${this.api}/${encodeURIComponent(String(id))}`);
  }
}
