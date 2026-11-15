import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';

const API_PREFIX = `${environment.BACKEND_ADDRESS}/api/`;

/**
 * Intercepteur des appels à l'API :
 * - envoie les cookies de session (plus besoin de `withCredentials` dans chaque service) ;
 * - sur un 401, la session n'est plus valide : on la vide et on renvoie vers la connexion.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_PREFIX)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((err: unknown) => {
      // Sur les routes d'authentification, un 401 signifie « mauvais identifiants » : le formulaire le gère
      const isAuthRoute = req.url.startsWith(`${API_PREFIX}auth/`);

      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthRoute) {
        authService.logout();
        void router.navigate(['/auth/signin']);
      }

      return throwError(() => err);
    })
  );
};
