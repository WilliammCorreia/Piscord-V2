import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShellComponent } from '../../../../core/components/shell/shell.component';

@Component({
    selector: 'app-settings-layout',
    templateUrl: './settings-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, RouterOutlet, ShellComponent]
})
export class SettingsLayoutComponent implements OnInit {
  id: string | null = "";

  /**
   * Constructeur du composant SettingsLayout
   * @param route Service pour accéder aux paramètres de route
   */
  constructor(private route: ActivatedRoute) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL
   */
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id");
  }
}
