import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, throwError } from 'rxjs';
import { Produto } from '../produto.model';
import { AuthService } from './auth.service';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export interface Pedido {
  id?: number;
  codigo: string;
  cliente: string;
  usuarioId: number | string;
  itens: string;
  total: number;
  data: string;
  status: string;
}

const CHAVE_STORAGE = 'seiva-carrinho';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private itensSubject = new BehaviorSubject<ItemCarrinho[]>(this.lerStorage());

  itens$: Observable<ItemCarrinho[]> = this.itensSubject.asObservable();

  qtd$: Observable<number> = this.itensSubject.pipe(
    map(itens => itens.reduce((soma, i) => soma + i.quantidade, 0))
  );

  total$: Observable<number> = this.itensSubject.pipe(
    map(itens => itens.reduce((soma, i) => soma + i.produto.preco * i.quantidade, 0))
  );

  get itensAtuais(): ItemCarrinho[] {
    return this.itensSubject.value;
  }

  /* ---------------- LEITURA / PERSISTÊNCIA ---------------- */

  private lerStorage(): ItemCarrinho[] {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      if (!bruto) return [];

      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista)) return [];
      return lista.filter(i => i?.produto && i.produto.id != null
        && Number.isFinite(i.produto.preco) && i.produto.preco > 0
        && Number.isInteger(Number(i.quantidade)) && Number(i.quantidade) > 0)
        .map(i => ({ produto: i.produto, quantidade: Number(i.quantidade) }));
    } catch {
      return [];
    }
  }

  private salvar(itens: ItemCarrinho[]): void {
    this.itensSubject.next(itens);

    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      /* storage indisponível — segue em memória */
    }
  }

  /* ---------------- OPERAÇÕES DO CARRINHO ---------------- */

  adicionar(produto: Produto): void {
    if (!Number.isFinite(produto.estoque) || produto.estoque < 1) return;
    const itens = this.itensSubject.value.map(i => ({ ...i }));
    const existente = itens.find(i => i.produto.id === produto.id);

    if (existente) {
      const limite = produto.estoque ?? Infinity;

      if (existente.quantidade >= limite) return;

      existente.quantidade += 1;
    } else {
      itens.push({ produto, quantidade: 1 });
    }

    this.salvar(itens);
  }

  aumentar(id: number): void {
    const itens = this.itensSubject.value.map(i => ({ ...i }));
    const item = itens.find(i => i.produto.id === id);

    if (!item) return;

    const limite = item.produto.estoque ?? Infinity;
    if (item.quantidade >= limite) return;

    item.quantidade += 1;
    this.salvar(itens);
  }

  diminuir(id: number): void {
    const itens = this.itensSubject.value.map(i => ({ ...i }));
    const item = itens.find(i => i.produto.id === id);

    if (!item) return;

    if (item.quantidade > 1) {
      item.quantidade -= 1;
      this.salvar(itens);
      return;
    }

    this.remover(id);
  }

  remover(id: number): void {
    const itens = this.itensSubject.value.filter(i => i.produto.id !== id);
    this.salvar(itens);
  }

  limpar(): void {
    this.salvar([]);
  }

  /* ---------------- FINALIZAÇÃO DO PEDIDO ---------------- */

  finalizarPedido(): Observable<Pedido> {
    const usuario = this.auth.atual;
    if (!usuario?.id) return throwError(() => new Error('Faça login para finalizar o pedido.'));
    const itens = this.itensSubject.value;

    if (itens.length === 0) {
      return throwError(() => new Error('Carrinho vazio.'));
    }

    const total = itens.reduce(
      (soma, i) => soma + i.produto.preco * i.quantidade,
      0
    );

    const pedido: Pedido = {
      codigo: 'PED-' + crypto.randomUUID(),
      cliente: usuario.nome,
      usuarioId: usuario.id,
      itens: itens.map(i => `${i.quantidade}x ${i.produto.nome}`).join(', '),
      total: Number(total.toFixed(2)),
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'Finalizado'
    };

    return this.http.post<Pedido>('/api/pedidos', pedido).pipe(
      tap(() => this.limpar())
    );
  }

}
