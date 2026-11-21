export interface ItemPedido {
  produtoId: number;
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Pedido {
  id?: number;
  codigo: string;
  cliente: string;
  usuarioId: number | string;
  itens: ItemPedido[] | string;
  total: number;
  data: string;
  status: string;
}
