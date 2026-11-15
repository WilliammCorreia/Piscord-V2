import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideTestingDeps } from '../../../testing/providers';
import { AuthService } from '../../features/auth/services/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('guards d\'authentification', () => {
  let authService: AuthService;
  let router: Router;

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('renvoie un visiteur non connecté vers la page de connexion', () => {
      const result = run(authGuard);

      expect(result).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(result as UrlTree)).toBe('/auth/signin');
    });

    it('laisse passer un utilisateur connecté', () => {
      authService.setUser({ id: '1', email: 'alice@test.com', username: 'alice' });

      expect(run(authGuard)).toBe(true);
    });
  });

  describe('guestGuard', () => {
    it('laisse un visiteur accéder aux formulaires', () => {
      expect(run(guestGuard)).toBe(true);
    });

    it("renvoie un utilisateur déjà connecté vers l'accueil", () => {
      authService.setUser({ id: '1', email: 'alice@test.com', username: 'alice' });

      const result = run(guestGuard);

      expect(router.serializeUrl(result as UrlTree)).toBe('/home');
    });
  });
});
