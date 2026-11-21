import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { erroUsuario } from '../../usuario-validacao';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../usuario.model';

@Component({
  selector: 'app-admin-usuarios', standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  //esse escopo primeiro verifica se vc é um adm e organiza tudo para o resto do codigo
  private service = inject(UsuarioService);
  private auth = inject(AuthService);
  preferenciasDisponiveis = ['Cristais', 'Tarô e Oráculos', 'Ervas Aromáticas e Banhos'];
  novo: Usuario = this.vazio();
  enviando = false;
  tentouEnviar = false;
  erroCadastro = '';
  sucessoCadastro = '';
  usuarios: Usuario[] = [];
  carregando = false;
  salvandoId: number | string | null = null;
  erro = '';
  sucesso = '';
  private vazio(): Usuario {
    return { nome: '', cpf: '', email: '', senha: '', admin: false, preferencias: [] };
  }
  //ele carregue a lista de usurios assim que a pagina é carregada, assim garantindo que tudo esta certo

  ngOnInit(): void { this.carregar(); }
  propriaConta(usuario: Usuario): boolean { return String(usuario.id) === String(this.auth.atual?.id); }
  carregar(): void {
    if (this.carregando || this.enviando || this.salvandoId !== null) return;
    this.carregando = true; this.erro = '';
    this.service.listar().pipe(finalize(() => this.carregando = false)).subscribe({
      next: lista => this.usuarios = lista,
      error: () => this.erro = 'Não foi possível carregar os usuários. Verifique a API.'
    });

    //essa é a função que faz com que usurios "clientes" recebam permissão de usuario, assim alternando no banco de dados o status dele
  //ele também possui a função de tornar um adm em cliente e retirar as permissões dele
  //
  }
  //ele altera o perfil do usuario de cliente para adm
  //ele recebe usuario como parametro
  alterarPerfil(usuario: Usuario): void {
    //esse if verifica se o perfil pode ser alterado
    //ele verifica se tem cadastro em andamento, verifica se a lista esta sendo carregada, se alteração ou exclusão esta funcionando
    //se possui id e se o usuario esta alterando sua propria conta
    if (this.enviando || this.carregando || this.salvandoId !== null || usuario.id == null || this.propriaConta(usuario)) return;
    //vai alterar o perfil para adm verificando antes e depois alterando
    const admin = usuario.admin !== true;
    //aqui ele confirma se quer mesmo alterar para adm
    if (!confirm(`${admin ? 'Tornar administrador' : 'Tornar cliente'}: ${usuario.nome}?`)) return;
    //registra qual usuario esta sendo alterado 
    this.salvandoId = usuario.id; this.erro = ''; this.sucesso = '';
    //envia a alteração para o serviço
    this.service.alterarPerfil(usuario.id, admin).pipe(finalize(() => this.salvandoId = null)).subscribe({
      next: atualizado => {
        //aqui atualiza a lista de usuarios exibida
        this.usuarios = this.usuarios.map(u => String(u.id) === String(atualizado.id) ? atualizado : u);
        this.sucesso = `Perfil de ${atualizado.nome} alterado para ${atualizado.admin ? 'Administrador' : 'Cliente'}. A pessoa deve sair e entrar novamente para atualizar sua sessão.`;
      },
      error: falha => this.erro = falha instanceof Error ? falha.message : 'Não foi possível alterar o perfil. Tente novamente.'
    });

        //essa função tem o papel de alternar as preferencias do usuario durante o cadastro
  }
  //recebe dois parametros
  alternarPreferencia(preferencia: string, selecionada: boolean): void {
    //ele recebe a preferencia que foi escolhida
    const atuais = this.novo.preferencias ?? [];
    //ele verifica o valor da caixa selecionada, ele encontra a parte selecionadas e pesquisa utilizando o filter para encontrar
    this.novo.preferencias = selecionada ? [...new Set([...atuais, preferencia])] : atuais.filter(p => p !== preferencia);
    this.atualizarErro();
  }
    //essa função é responsavel por excluir usuarios do banco de dados, ele impede que o proprio login seja excluido

    //recebe o usuario como parametro
  excluirUsuario(usuario: Usuario): void {
    //verificação se o usuario pode ser excluida as mesmas verificações da alteração
    if (this.enviando || this.carregando || this.salvandoId !== null || usuario.id == null || this.propriaConta(usuario)) return;
    //confimação se quer realmente excluir a conta
    if (!confirm(`Excluir a conta de ${usuario.nome}? Esta ação não pode ser desfeita.`)) return;
    //prepara a exclusão
    this.salvandoId = usuario.id; this.erro = ''; this.sucesso = '';
    //envia a solicitação
    this.service.excluir(usuario.id).pipe(finalize(() => this.salvandoId = null)).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => String(u.id) !== String(usuario.id));
        this.sucesso = `Conta de ${usuario.nome} excluída.`;
      },
      error: () => this.erro = 'Não foi possível excluir a conta. Verifique a API e tente novamente.'
    });
  }
  //essa parte tem o papel de checar se algum campo esta vazio e alerta o adm

  atualizarErro(): void {
    this.sucessoCadastro = '';
    this.erroCadastro = this.tentouEnviar ? erroUsuario(this.novo) : '';
  }

  //formata o cpf que o adm escrever no campo de usuario
  mascararCpf(valor: string): void {
    this.novo.cpf = valor.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.atualizarErro();
  }

   //ela é responsável por criar o usuario pelo adm, ele faz toda a verificação dos campos que precisam ser preenchidos, caso de algum
  //erro ele alerta no momento em que tentar cadastrar
  salvar(): void {
    if (this.enviando || this.salvandoId !== null || this.carregando) return;
    this.tentouEnviar = true;
    this.sucessoCadastro = '';
    this.erroCadastro = erroUsuario(this.novo);
    if (this.erroCadastro) return;
    this.enviando = true;
    this.service.cadastrarPeloAdministrador(this.novo)
      .pipe(finalize(() => this.enviando = false)).subscribe({
        next: usuario => {
          this.sucessoCadastro = `${usuario.nome} cadastrado como ${usuario.admin ? 'Administrador' : 'Cliente'}.`;
          this.novo = this.vazio();
          this.tentouEnviar = false;
          this.usuarios = [...this.usuarios, usuario];
        },
        error: falha => {
          this.erroCadastro = falha instanceof Error ? falha.message
            : 'Não foi possível salvar o usuário. Verifique a API e tente novamente.';
        }
      });
  }
}
