import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { AuthService } from './auth.service';
describe('Alteração de perfil', () => {
 it('envia somente admin via PATCH', () => {
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),{provide:AuthService,useValue:{atual:{id:1,admin:true}}}]});
  TestBed.inject(UsuarioService).alterarPerfil(2,true).subscribe();
  const http=TestBed.inject(HttpTestingController);
  const req=http.expectOne('/api/usuarios/2');
  expect(req.request.method).toBe('PATCH');
  expect(req.request.body).toEqual({admin:true});
  req.flush({id:2,admin:true}); http.verify();
 });
});
