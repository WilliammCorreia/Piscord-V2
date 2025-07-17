import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings-layout',
  standalone: false,
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss'
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
