import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Réserve une route aux utilisateurs connectés.
 * C'est un confort de navigation : la vraie protection est côté API, qui répond 401
 * si la session n'est plus valide (voir apiInterceptor).
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user ? true : router.createUrlTree(['/auth/signin']);
};

/**
 * Renvoie un utilisateur déjà connecté vers l'accueil plutôt que vers les formulaires d'authentification
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user ? router.createUrlTree(['/home']) : true;
};
