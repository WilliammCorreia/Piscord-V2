import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { apiInterceptor } from '../app/core/interceptors/api.interceptor';
import { SocketService } from '../app/features/server/services/socketio/socket.service';
import { FakeSocketService } from './fake-socket.service';

/**
 * Dépendances communes aux tests : HttpClient simulé (avec l'intercepteur de l'application),
 * routeur et socket factice.
 */
export function provideTestingDeps(routes: Routes = []): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideHttpClientTesting(),
    provideRouter(routes),
    { provide: SocketService, useClass: FakeSocketService },
  ];
}
