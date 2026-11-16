import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { apiInterceptor } from '../app/core/interceptors/api.interceptor';
import { SocketService } from '../app/features/server/services/socketio/socket.service';
import { FakeSocketService } from './fake-socket.service';

/**
 * Dépendances communes aux tests : HttpClient simulé (avec l'intercepteur de l'application),
 * routeur, socket factice et service worker désactivé.
 */
export function provideTestingDeps(routes: Routes = []): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideHttpClientTesting(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', { enabled: false }),
    { provide: SocketService, useClass: FakeSocketService },
  ];
}
