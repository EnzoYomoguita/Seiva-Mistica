import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CadastroComponent } from './cadastro.component';
import { AuthService } from '../../services/auth.service';

describe('Cadastro: regressões de validação', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [CadastroComponent],
    providers: [provideRouter([]), { provide: AuthService, useValue: { cadastrar: jasmine.createSpy().and.returnValue(of({ id: 3 })) } }]
  }));

  it('troca o erro de e-mail pelo de senha quando o usuário corrige o e-mail', fakeAsync(() => {
    const fixture = TestBed.createComponent(CadastroComponent);
    const c = fixture.componentInstance;
    c.nome = 'Cliente Teste';
    c.cpf = '52998224725';
    fixture.detectChanges(); tick();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('e-mail');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('[name="email"]');
    email.value = 'cliente@exemplo.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    tick(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('senha');
    expect(TestBed.inject(AuthService).cadastrar).not.toHaveBeenCalled();
  }));

  it('rejeita CPF repetido, dígito errado e senha acima do limite', () => {
    const c = TestBed.createComponent(CadastroComponent).componentInstance;
    c.nome = 'Cliente Teste'; c.email = 'cliente@exemplo.com'; c.senha = '123456';
    for (const cpf of ['11111111111', '52998224724']) {
      c.cpf = cpf; expect(c.validar()).toContain('CPF inválido');
    }
    c.cpf = '52998224725'; c.senha = 'a'.repeat(65);
    expect(c.validar()).toContain('6 e 64');
    c.senha = '123456'; expect(c.validar()).toBe('');
  });
});
