import '@angular/compiler';
import assert from 'node:assert/strict';
import { firstValueFrom, of } from 'rxjs';
import { UsuarioService } from '../src/app/services/usuario.service';
let chamadas: any[] = [];
const http = { patch: (url: string, body: any) => { chamadas.push({url,body}); return of({id: 2, nome: 'Cliente', ...body}); } };
const auth: any = { atual: {id: 1, admin: true} };
const service = new UsuarioService(http as any, auth);
for (const admin of [true,false]) {
 const u = await firstValueFrom(service.alterarPerfil(2,admin));
 assert.equal(u.admin,admin);
 assert.deepEqual(chamadas.at(-1),{url:'/api/usuarios/2',body:{admin}});
}
await assert.rejects(firstValueFrom(service.alterarPerfil(1,false)),/próprio perfil/);
for (const atual of [null,{id:3,admin:false}]) {
 auth.atual=atual;
 await assert.rejects(firstValueFrom(service.alterarPerfil(2,true)),/Apenas administradores/);
}
assert.equal(chamadas.length,2);
console.log('5 cenários passaram: promoção, reversão, proteção da própria conta, visitante e cliente.');

const dados = { nome: 'Pessoa Teste', cpf: '52998224725', email: 'teste@exemplo.com', senha: '123456', admin: false };
let posts: any[] = [];
let lista: any[] = [];
const sessao = {id:1,admin:true};
const criador = new UsuarioService({get:()=>of(lista),post:(url:any,body:any)=>{posts.push(body);return of({...body,id:3});}} as any,{atual:sessao} as any);
for (const admin of [true,false]) {
 const u=await firstValueFrom(criador.cadastrarPeloAdministrador({...dados,admin}));
 assert.equal(u.admin,admin);
}
lista=[dados];
await assert.rejects(firstValueFrom(criador.cadastrarPeloAdministrador(dados)),/CPF já/);
lista=[{...dados,cpf:'11144477735'}];
await assert.rejects(firstValueFrom(criador.cadastrarPeloAdministrador(dados)),/E-mail já/);
await assert.rejects(firstValueFrom(criador.cadastrarPeloAdministrador({...dados,cpf:'11111111111'})),/CPF inválido/);
assert.equal(posts.length,2);
assert.equal(sessao.id,1);
console.log('Criação dos dois perfis, duplicidade e CPF inválido verificados.');

const preferencias = ['Cristais', 'Tarô e Oráculos'];
lista = [];
const cadastrado = await firstValueFrom(criador.cadastrarPeloAdministrador({...dados, preferencias}));
assert.deepEqual(cadastrado.preferencias, preferencias);
assert.notEqual(cadastrado.preferencias, preferencias);
const deletes: string[] = [];
const autorizacao: any = { atual: {id: 1, admin: true} };
const removedor = new UsuarioService({delete:(url:string)=>{deletes.push(url);return of(undefined);}} as any, autorizacao);
await firstValueFrom(removedor.excluir(2));
assert.deepEqual(deletes, ['/api/usuarios/2']);
await assert.rejects(firstValueFrom(removedor.excluir('1')), /própria conta/);
for (const atual of [null, {id:3,admin:false}]) {
 autorizacao.atual = atual;
 await assert.rejects(firstValueFrom(removedor.excluir(2)), /Apenas administradores/);
}
assert.equal(deletes.length, 1);
console.log('Preferências preservadas e exclusão autorizada/protegida verificadas.');
