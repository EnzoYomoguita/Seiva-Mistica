import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap, tap, throwError } from 'rxjs';
import { Usuario } from '../usuario.model';

//api indica onde faz a solicitações, chave identifica onde dados forma guardados no navegador
const API = '/api';
const CHAVE = 'seiva-usuario';

//essa pagina faz a verificação dos dados digitados, e se bate com o banco de dados, além da formatação e mantem o usuario logado até fechar o site
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private subject = new BehaviorSubject<Usuario | null>(this.lerSessao());
  usuario$ = this.subject.asObservable();

  get atual(): Usuario | null {
    return this.subject.value;
  }

  login(cpf: string, senha: string): Observable<Usuario | null> {
    //limpa o cpf ele retira tudo que não for numero
    const digitos = (cpf || '').replace(/\D/g, '');
    //busca o usuario na api
    return this.http.get<Usuario[]>(`${API}/usuarios`).pipe(
      map(lista => {
        const achado = lista.find(
          //percorre a lista e procura o usuário
          u => (u.cpf || '').replace(/\D/g, '') === digitos && u.senha === senha
        );

        if (!achado) {
          return null;
        }

        this.salvarSessao(achado);
        return achado;
      })
    );
  }
  //função para cadastrar
  cadastrar(usuario: Usuario): Observable<Usuario> {
    //formata o cpf
    const cpfDigitos = (usuario.cpf || '').replace(/\D/g, '');
    //formata o email
    const email = (usuario.email || '').trim().toLowerCase();

    //busca os usuarios existentes
    return this.http.get<Usuario[]>(`${API}/usuarios`).pipe(
      switchMap(lista => {
        //verifica se existe um usuario com esse cpf
        const cpfRepetido = lista.some(
          u => (u.cpf || '').replace(/\D/g, '') === cpfDigitos
        );
        //verifia se existe um usuario com esse email
        const emailRepetido = lista.some(
          u => (u.email || '').trim().toLowerCase() === email
        );
        //caso tenha ele avisa que ja esta cadastrado
        if (cpfRepetido || emailRepetido) {
          return throwError(
            () => ({ status: 409, message: 'CPF ou e-mail já cadastrado' }) as any
          );
        }
        //aqui envia pra api o cadastro
        return this.http.post<Usuario>(`${API}/usuarios`, { ...usuario, cpf: cpfDigitos, email, admin: false });
      }),
      //salva a sessão depois de cadastrar
      tap(novo => this.salvarSessao(novo))
    );
  }
  //encerra a sessão
  sair(): void {
    //atualiza o usuario para nulo, mostrando que não tem ninguem logado
    this.subject.next(null);
    try {
      //Remove do armazenamento do navegador os dados da sessão salvos com a chave
      localStorage.removeItem(CHAVE);
    } catch {}
  }
  //ele mantem os usuarios logados, e salva os dados do usuario que esta logado
  private salvarSessao(usuario: Usuario): void {
    //ele faz com que a senha não seja incluida na sessão
    const { senha, ...sessao } = usuario;
    //isso mostrar para outras partes do angular que o usuario esta logado
    this.subject.next(sessao);
    try {
      //isso salva no navegador
      localStorage.setItem(CHAVE, JSON.stringify(sessao));
    } catch {}
  }
//essa função verifica se o usuario ja estava logado anteriormente 
  private lerSessao(): Usuario | null {
    try {
      //caso ele não esteja logado ele vai retornar nulo
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) {
        return null;
      }
      //transforma o texto em objeto
      const dados = JSON.parse(bruto);
      //validação dos dados, ele precisa existir, ser um objeto, ter id, nome e cpf em string
      if (!dados || typeof dados !== 'object' || !dados.id || typeof dados.nome !== 'string' || typeof dados.cpf !== 'string') return null;
      const { senha, ...sessao } = dados;
      return sessao;
    } catch {
      return null;
    }
  }
}
