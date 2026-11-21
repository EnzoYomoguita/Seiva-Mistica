import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../usuario.model';
import { cpfValido } from '../../cpf.util';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  nome = '';
  cpf = '';
  email = '';
  senha = '';
  preferencias: string[] = [];

  opcoes = ['Cristais', 'Tarô e Oráculos', 'Ervas Aromáticas e Banhos'];

  erro = '';
  enviando = false;

  alternar(pref: string): void {
    const i = this.preferencias.indexOf(pref);
    if (i >= 0) {
      this.preferencias.splice(i, 1);
    } else {
      this.preferencias.push(pref);
    }
  }

  mascararCpf(evento?: Event): void {
    if (evento) {
      const alvo = evento.target as HTMLInputElement;
      this.cpf = alvo.value;
    }

    const n = this.cpf.replace(/\D/g, '').slice(0, 11);
    this.cpf = n
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  tentouEnviar = false;

  validar(): string {
    const nome = this.nome.trim();
    const email = this.email.trim();
    if (nome.length < 3 || nome.length > 80) return 'O nome deve ter entre 3 e 80 caracteres.';
    if (!this.cpf.replace(/\D/g, '')) return 'Informe seu CPF com 11 dígitos.';
    if (!cpfValido(this.cpf)) return 'CPF inválido. Confira os 11 dígitos e tente novamente.';
    if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) return 'Informe um e-mail válido com até 254 caracteres.';
    if (this.senha.length < 6 || this.senha.length > 64) return 'A senha deve ter entre 6 e 64 caracteres.';
    return '';
  }

  atualizarErro(): void {
    this.erro = this.tentouEnviar ? this.validar() : '';
  }

  criar(): void {
    if (this.enviando) return;
    this.tentouEnviar = true;
    this.erro = this.validar();
    if (this.erro) return;

    const novo: Usuario = {
      nome: this.nome.trim(),
      cpf: this.cpf,
      email: this.email.trim().toLowerCase(),
      senha: this.senha,
      preferencias: [...this.preferencias]
    };

    this.enviando = true;

    this.auth.cadastrar(novo).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/home']);
      },
      error: (falha: { status?: number }) => {
        this.enviando = false;
        this.erro = falha.status === 409
          ? 'CPF ou e-mail já cadastrado.'
          : 'Não foi possível acessar o servidor. Tente novamente.';
      }
    });
  }

}
