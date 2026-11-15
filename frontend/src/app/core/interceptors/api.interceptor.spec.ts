import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FakeSocketService } from '../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../testing/providers';
import { AuthService } from '../../features/auth/services/auth.service';
import { SocketService } from '../../features/server/services/socketio/socket.service';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;
  let socket: FakeSocketService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;

    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    authService.setUser({ id: '1', email: 'alice@test.com', username: 'alice' });
  });

  afterEach(() => httpMock.verify());

  it("envoie les cookies de session avec les appels à l'API", () => {
    http.get('/api/server/user').subscribe();

    const req = httpMock.expectOne('/api/server/user');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ success: true, data: [] });
  });

  it("n'envoie pas les cookies vers une autre adresse", () => {
    http.get('https://exemple.test/data').subscribe();

    const req = httpMock.expectOne('https://exemple.test/data');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });

  it('vide la session, ferme le socket et renvoie vers la connexion sur un 401', () => {
    http.get('/api/server/user').subscribe({ error: () => undefined });

    httpMock.expectOne('/api/server/user').flush(
      { success: false, code: 'REFRESH_FAILED', message: 'Reconnexion requise' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authService.user).toBeNull();
    expect(socket.disconnected).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
  });

  it('laisse le formulaire de connexion gérer son propre 401', () => {
    http.post('/api/auth/signin', {}).subscribe({ error: () => undefined });

    httpMock.expectOne('/api/auth/signin').flush(
      { success: false, code: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authService.user).not.toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
