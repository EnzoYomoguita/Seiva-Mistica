import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CarrinhoService } from './carrinho.service';
import { AuthService } from './auth.service';
import { Produto } from '../produto.model';

describe('Carrinho: quantidade e pedidos', () => {
  const produto: Produto = { id: 1, nome: 'Cristal', preco: 25, estoque: 2, categoria: 'Cristais', imagem: '', descricao: '' };
  beforeEach(() => {
    localStorage.removeItem('seiva-carrinho');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: AuthService, useValue: { atual: { id: 2, nome: 'Cliente' } } } ] });
  });
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); localStorage.removeItem('seiva-carrinho'); });

  it('emite 1, 2, 1, 0 e não adiciona produto sem estoque', () => {
    const service = TestBed.inject(CarrinhoService);
    const quantidades: number[] = [];
    const sub = service.qtd$.subscribe(n => quantidades.push(n));
    service.adicionar({ ...produto, estoque: 0 });
    service.adicionar(produto); service.adicionar(produto); service.adicionar(produto);
    service.diminuir(1); service.remover(1);
    expect(quantidades).toEqual([0, 1, 2, 1, 0]); sub.unsubscribe();
  });

  it('normaliza quantidade antiga armazenada como texto', () => {
    localStorage.setItem('seiva-carrinho', JSON.stringify([{ produto, quantidade: '2' }]));
    const service = TestBed.inject(CarrinhoService);
    service.qtd$.subscribe(n => expect(n).toBe(2)).unsubscribe();
  });

  it('envia pedido à API com o identificador do usuário e preserva carrinho em falha', () => {
    const service = TestBed.inject(CarrinhoService);
    service.adicionar(produto);
    service.finalizarPedido().subscribe({ error: () => {} });
    const req = TestBed.inject(HttpTestingController).expectOne('/api/pedidos');
    expect(req.request.body.usuarioId).toBe(2);
    req.flush('Falha', { status: 500, statusText: 'Erro' });
    expect(service.itensAtuais.length).toBe(1);
  });
});
