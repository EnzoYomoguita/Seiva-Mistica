import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css']
})
export class CarrinhoComponent implements OnInit {
  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  itens: any[] = [];
  total = 0;
  frete = 0;

  carregando = false;
  erro = '';
  ok = '';

  ngOnInit(): void {
    this.carrinhoService.itens$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(itens => {
      this.itens = itens;
      this.total = this.calcularTotal(itens) + this.frete;
    });
  }

  private calcularTotal(itens: any[]): number {
    return itens.reduce(
      (soma, item) => soma + item.produto.preco * item.quantidade,
      0
    );
  }

  aumentar(item: any): void {
    this.carrinhoService.aumentar(item.produto.id);
  }

  diminuir(item: any): void {
    this.carrinhoService.diminuir(item.produto.id);
  }

  limpar(): void {
    this.carrinhoService.limpar();
  }

  fecharPedido(): void {
    if (this.carregando || this.itens.length === 0) return;
    if (!this.auth.atual) {
      this.router.navigate(['/login']);
      return;
    }

    this.erro = '';
    this.ok = '';
    this.carregando = true;

    this.carrinhoService.finalizarPedido().subscribe({
      next: pedido => {
        this.carregando = false;
        this.ok = `Pedido ${pedido.codigo} registrado.`;
        this.router.navigate(['/api/pedidos']);
      },
      error: () => {
        this.carregando = false;
        this.erro = 'Não foi possível registrar o pedido. Verifique o servidor.';
      }
    });
  }
}
