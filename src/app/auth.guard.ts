import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

//essa função faz a verificação se o usuario pode acessar partes do site
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.atual ? true : inject(Router).createUrlTree(['/login']);
};

//esse verifica se o usuario logado é um adm
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
   //esse if verifica se tem alguem logado
  if (!auth.atual) return router.createUrlTree(['/login']);
  //ele verifica se ele é adm
  return auth.atual.admin === true ? true : router.createUrlTree(['/home']);
};
