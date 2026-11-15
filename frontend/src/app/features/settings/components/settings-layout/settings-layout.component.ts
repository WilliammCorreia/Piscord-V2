import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-settings-layout',
    templateUrl: './settings-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './settings-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class SettingsLayoutComponent {
  id: string | null = "";

  /**
   * Constructeur du composant ServerLayout
   * @param route Service pour accéder aux paramètres de route
   * @param serverService Service pour les opérations liées aux serveurs
   */
  constructor(private route: ActivatedRoute) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL et charge la liste des utilisateurs
   */
  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
  }
}
