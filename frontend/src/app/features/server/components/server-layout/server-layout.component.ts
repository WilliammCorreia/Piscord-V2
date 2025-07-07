import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../../home/components/server/services/server.service';
import { ErrorResponse, Member, ServersResponse } from '../../models/server';

@Component({
  selector: 'app-server-layout',
  standalone: false,
  templateUrl: './server-layout.component.html',
  styleUrl: './server-layout.component.scss'
})
export class ServerLayoutComponent {
  id: string | null = "";
  members: Member[] = [];

  /**
   * Constructeur du composant ServerLayout
   * @param route Service pour accéder aux paramètres de route
   * @param serverService Service pour les opérations liées aux serveurs
   */
  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService
  ) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL et charge la liste des utilisateurs
   */
  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (typeof this.id === "string") {
      await this.listUsers(this.id);
    }
  }

  /**
   * Vérifie si la réponse est de type ServersResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un ServersResponse, false sinon
   */
  isServersResponse(res: ServersResponse | ErrorResponse): res is ServersResponse {
    return res.success === true;
  }

  /**
   * Récupère la liste des membres d'un serveur spécifique
   * @param serverId ID du serveur dont on veut récupérer les membres
   */
  async listUsers(serverId: string) {
    this.members = [];

    this.serverService.getServerByUser().subscribe({
      next: (res) => {
        if (this.isServersResponse(res)) {
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i]._id === serverId) {
              const server = res.data[i];
              this.members = server.memberIds;
            }
          }
        }
      },
      error: (err) => {
        console.error("Erreur la récupération des membres:", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    })
  }
}