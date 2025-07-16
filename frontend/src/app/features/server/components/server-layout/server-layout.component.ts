import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../../services/server/server.service';
import { ChannelService } from '../../services/channel/channel.service';
import { ErrorResponse, Member, ServersResponse } from '../../models/server.model';
import { Channel, ChannelsResponse } from '../../models/channel.model';
import { SocketService } from '../../services/socketio/socket.service';

@Component({
  selector: 'app-server-layout',
  standalone: false,
  templateUrl: './server-layout.component.html',
  styleUrl: './server-layout.component.scss'
})
export class ServerLayoutComponent {
  id: string | null = "";
  members: Member[] = [];
  channels: Channel[] = [];
  currentChannelId: string = "";

  /**
   * Constructeur du composant ServerLayout
   * @param route Service pour accéder aux paramètres de route
   * @param serverService Service pour les opérations liées aux serveurs
   */
  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService,
    private channelService: ChannelService,
    private socketService: SocketService
  ) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL et charge la liste des utilisateurs
   */
  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (typeof this.id === "string") {
      await this.listUsers(this.id);
      await this.listChannels(this.id);
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
   * Vérifie si la réponse est de type ChannelsResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un ChannelsResponse, false sinon
   */
  isChannelsResponse(res: ChannelsResponse | ErrorResponse): res is ChannelsResponse {
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
        console.error("Erreur lors de la récupération des membres: ", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    });
  }

  async listChannels(serverId: string) {
    this.channels = [];

    this.channelService.getChannelByServer(serverId).subscribe({
      next: (res) => {
        if (this.isChannelsResponse(res)) {
          this.channels = res.data;
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des salons: ", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    });
  }

  changeChannel(newChannelId: string) {
    if (this.currentChannelId != "") {
      this.socketService.emit("leave-channel", this.currentChannelId);
    }
    this.socketService.emit("join-channel", newChannelId);
    this.currentChannelId = newChannelId;
  }
}