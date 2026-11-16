import { Component, ChangeDetectionStrategy, HostListener, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class AppComponent implements OnDestroy {
  /** Pas de réseau : l'application installée (PWA) s'ouvre quand même, mais rien ne peut être envoyé */
  offline: boolean = !navigator.onLine;

  /** Une nouvelle version a été téléchargée par le service worker et attend un rechargement */
  updateAvailable: boolean = false;

  private readonly subscription?: Subscription;

  constructor(swUpdate: SwUpdate) {
    // Le service worker n'est actif qu'en production, sur une page sécurisée (HTTPS ou localhost)
    if (swUpdate.isEnabled) {
      this.subscription = swUpdate.versionUpdates
        .pipe(filter((event) => event.type === 'VERSION_READY'))
        .subscribe(() => { this.updateAvailable = true; });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('window:online')
  onOnline(): void {
    this.offline = false;
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.offline = true;
  }

  /** On laisse l'utilisateur choisir le moment : un rechargement automatique ferait perdre un message en cours de saisie */
  reload(): void {
    document.location.reload();
  }
}
