import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { VoiceBarComponent } from '../voice-bar/voice-bar.component';

/**
 * Coque commune à toutes les mises en page : un menu de navigation et la page.
 *
 * Mobile d'abord : le menu est un tiroir ouvert par le bouton de la barre du haut.
 * À partir de 768 px, il devient une colonne fixe et la barre disparaît.
 *
 * Utilisation :
 *   <app-shell homeLink="/home">
 *     <ng-container shellNav> ...liens du menu... </ng-container>
 *     <router-outlet />
 *   </app-shell>
 */
@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrl: './shell.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, VoiceBarComponent]
})
export class ShellComponent implements OnDestroy {
  /** Destination du logo */
  @Input() homeLink: string | unknown[] = '/home';

  /** Menu plus large sur grand écran (deux colonnes : salons et membres) */
  @Input() wide: boolean = false;

  /** Pastille affichée sur le bouton du menu (demandes d'ami, messages non lus) */
  @Input() badge: number = 0;

  menuOpen: boolean = false;

  private readonly subscription: Subscription;

  constructor(router: Router, changeDetector: ChangeDetectorRef) {
    // Choisir une destination dans le tiroir le referme
    this.subscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        // La navigation ne vient pas d'un événement du gabarit : on signale le changement,
        // pour que le tiroir se referme aussi dans un parent en détection OnPush
        changeDetector.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
