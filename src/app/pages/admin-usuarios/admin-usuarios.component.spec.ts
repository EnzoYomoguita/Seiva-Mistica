import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AdminUsuariosComponent } from './admin-usuarios.component';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
describe('Gerenciar perfis', () => {
 it('mostra cadastro e usuários existentes', () => {
  TestBed.configureTestingModule({imports:[AdminUsuariosComponent],providers:[provideRouter([]),provideNoopAnimations(),{provide:UsuarioService,useValue:{listar:()=>of([{id:2,nome:'Cliente',email:'c@teste.com',admin:false}])}},{provide:AuthService,useValue:{atual:{id:1,admin:true}}}]});
  const f=TestBed.createComponent(AdminUsuariosComponent);f.detectChanges();
  expect(f.nativeElement.querySelector('form')).not.toBeNull();
  expect(f.nativeElement.textContent).toContain('Tornar administrador');
 });
});
