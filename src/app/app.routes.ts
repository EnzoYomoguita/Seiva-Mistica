import { Routes } from '@angular/router';
import { AdminUsuariosComponent } from './pages/admin-usuarios/admin-usuarios.component';
import { loginGuard, adminGuard } from './auth.guard';

import { HomeComponent } from './pages/home/home.component';
import { SobreComponent } from './pages/sobre/sobre.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { CategoriaComponent } from './pages/categoria/categoria.component';
import { CarrinhoComponent } from './pages/carrinho/carrinho.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminEditarComponent } from './pages/admin-editar/admin-editar.component';
import { RelatorioComponent } from './pages/relatorio/relatorio.component';

//essa pagina é responavel pelo caminho de cada pagina, quantas paginas ele possui e permiti o acesso de acordo com que pode acessar,
//caso seja um adm ele possui permissão
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'sobre', component: SobreComponent },

  { path: 'catalogo', component: CatalogoComponent },
  { path: 'categoria/:nome', component: CategoriaComponent },

  { path: 'carrinho', component: CarrinhoComponent },
  { path: 'pedidos', component: PedidosComponent, canActivate: [loginGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },

  { path: 'admin-usuarios', component: AdminUsuariosComponent, canActivate: [adminGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin-editar', component: AdminEditarComponent, canActivate: [adminGuard] },
  { path: 'relatorio', component: RelatorioComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'home' }
];
