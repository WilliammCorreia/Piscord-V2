import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ServerService } from '../../../../../server/services/server/server.service';
import { Server } from '../../../../../server/models/server.model';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './list.component.scss',
    imports: [RouterLink]
})
export class ListComponent implements OnInit {
  protected servers: Server[] = [];

  constructor(private serverService: ServerService) { }

  ngOnInit(): void {
    this.listServers();
  }

  listServers(): void {
    this.serverService.getServerByUser().subscribe({
      next: (res) => {
        this.servers = res.data;
      },
      error: (err) => {
        console.error("Erreur la récupération des serveurs:", err);
        // Sur un 401, l'intercepteur renvoie déjà vers la connexion
        if (err.status !== 401) {
          alert("Une erreur est survenue, veuillez ressayer plus tard.");
        }
      }
    });
  }
}
