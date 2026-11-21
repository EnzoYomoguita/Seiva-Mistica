import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
//cuida do comportamento da tela
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  //o private auth chama o serviço de autenticação
  private auth = inject(AuthService);
  //ele envia o usuario para home depois que logar
  private router = inject(Router);

  cpf = '';
  senha = '';
  //o erro guarda uma mensagem caso de errado. Enviado começa como false pois nada foi enviado
  erro = '';
  enviando = false;

  //esse evento faz como que o campo cpf fique no formato de cpf
  mascararCpf(evento: Event): void {
    const alvo = evento.target as HTMLInputElement;
    const n = alvo.value.replace(/\D/g, '').slice(0, 11);
    this.cpf = n
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  //é uma função responsável pela tentativa de login, ela faz a verificação
  entrar(): void {
    //esse if evita envios duplicados
    if (this.enviando) return;
    this.erro = '';

    //verifica se os campos estão vázios
    if (!this.cpf.trim() || !this.senha.trim()) {
      this.erro = 'Preencha CPF e senha.';
      return;
    }

    //fica true por um momento para marcar que esta ocorrendo o processo
    this.enviando = true;

    //ele faz um pedido e manda para o auth.service
    this.auth.login(this.cpf, this.senha).subscribe({
      //ele envia e recebe o processo se os valores batem com o banco de dados
      next: (usuario) => {
        this.enviando = false;
        if (!usuario) {
          this.erro = 'CPF ou senha incorretos.';
          return;
        }
         //aqui envia para a home caso de certo o login
        this.router.navigate(['/home']);
      },
      error: () => {
        this.enviando = false;
        this.erro = 'Não foi possível acessar o servidor. Tente novamente.';
      }
    });
  }
}
