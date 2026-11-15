import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ServerService } from '../../services/server/server.service';
import { ChannelService } from '../../services/channel/channel.service';
import { Member } from '../../models/server.model';
import { Channel } from '../../models/channel.model';

@Component({
    selector: 'app-server-layout',
    templateUrl: './server-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './server-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class ServerLayoutComponent implements OnInit {
  id: string | null = "";
  members: Member[] = [];
  channels: Channel[] = [];

  /**
   * Constructeur du composant ServerLayout
   * @param route Service pour accéder aux paramètres de route
   * @param router Service de navigation
   * @param serverService Service pour les opérations liées aux serveurs
   * @param channelService Service pour les opérations liées aux salons
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService,
    private channelService: ChannelService
  ) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL,
   * puis charge la liste des membres et celle des salons
   */
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id");
    if (typeof this.id === "string") {
      this.listUsers(this.id);
      this.listChannels(this.id);
    }
  }

  /**
   * Récupère la liste des membres d'un serveur spécifique
   * @param serverId ID du serveur dont on veut récupérer les membres
   */
  listUsers(serverId: string): void {
    this.members = [];

    this.serverService.getServerById(serverId).subscribe({
      next: (res) => {
        this.members = res.data.memberIds;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des membres: ", err);

        // Serveur inexistant, identifiant invalide ou utilisateur non membre : rien à afficher ici
        if ([400, 403, 404].includes(err.status)) {
          this.router.navigate(["/home/server"]);
        } else if (err.status !== 401) {
          alert("Une erreur est survenue, veuillez ressayer plus tard.");
        }
      }
    });
  }

  /**
   * Récupère la liste des salons d'un serveur spécifique
   * @param serverId ID du serveur dont on veut récupérer les salons
   */
  listChannels(serverId: string): void {
    this.channels = [];

    this.channelService.getChannelsByServerId(serverId).subscribe({
      next: (res) => {
        this.channels = res.data;
      },
      error: (err) => {
        // Les erreurs d'accès sont déjà traitées par listUsers
        console.error("Erreur lors de la récupération des salons: ", err);
      }
    });
  }
}
