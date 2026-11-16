import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { PresenceService } from './core/services/presence.service';
import { AuthService } from './features/auth/services/auth.service';
import { FriendService } from './features/friends/services/friend.service';
import { VoiceService } from './features/server/services/voice/voice.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // L'application repose sur zone.js (composants en ChangeDetectionStrategy.Eager)
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),

    // PWA : le service worker met l'application en cache pour l'installer et l'ouvrir hors ligne.
    // Désactivé en développement, où il masquerait les changements de code.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),

    provideAppInitializer(() => {
      // Ces services suivent des événements temps réel quelle que soit la page affichée
      // (présence, demandes d'ami, messages privés, salons vocaux) : on les crée dès le départ.
      inject(PresenceService);
      inject(FriendService);
      inject(VoiceService);

      inject(AuthService).resumeSession();
    }),
  ],
};
