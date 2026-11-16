import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShellComponent } from '../../../../core/components/shell/shell.component';
import { apiErrorMessage } from '../../../../core/models/api.model';
import { PresenceService } from '../../../../core/services/presence.service';
import { FriendService } from '../../../friends/services/friend.service';
import { ServerService } from '../../services/server/server.service';
import { ChannelService } from '../../services/channel/channel.service';
import { SocketService } from '../../services/socketio/socket.service';
import { VoiceService } from '../../services/voice/voice.service';
import { Member, MemberJoinedEvent } from '../../models/server.model';
import { Channel } from '../../models/channel.model';

@Component({
    selector: 'app-server-layout',
    templateUrl: './server-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './server-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, ShellComponent]
})
export class ServerLayoutComponent implements OnInit, OnDestroy {
  id: string | null = "";
  members: Member[] = [];
  channels: Channel[] = [];

  private subscriptions = new Subscription();

  /**
   * Constructeur du composant ServerLayout
   * @param route Service pour accéder aux paramètres de route
   * @param router Service de navigation
   * @param serverService Service pour les opérations liées aux serveurs
   * @param channelService Service pour les opérations liées aux salons
   * @param socketService Connexion temps réel (arrivée de membres, reconnexion)
   * @param presence Statut de connexion des membres
   * @param voice Salons vocaux
   * @param friendService Amis : pour proposer d'ajouter un membre
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverService: ServerService,
    private channelService: ChannelService,
    private socketService: SocketService,
    protected presence: PresenceService,
    protected voice: VoiceService,
    protected friendService: FriendService
  ) { }

  /**
   * Initialise le composant en récupérant l'ID du serveur depuis l'URL,
   * puis charge la liste des membres et celle des salons
   */
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id");
    const serverId = this.id;
    if (typeof serverId !== "string") return;

    this.listUsers(serverId);
    this.listChannels(serverId);

    this.subscriptions.add(
      this.socketService.listen<MemberJoinedEvent>("member-joined").subscribe((event) => {
        if (event.serverId !== serverId || this.members.some((member) => member._id === event.member._id)) return;

        this.members = [...this.members, event.member];
        this.presence.set(event.member._id, event.member.online);
      })
    );

    // Après une reconnexion, les statuts et l'occupation des salons vocaux ont pu changer
    this.subscriptions.add(
      this.socketService.listen<void>("connect").subscribe(() => {
        this.listUsers(serverId);
        this.listChannels(serverId);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get textChannels(): Channel[] {
    return this.channels.filter((channel) => channel.type !== 'voice');
  }

  get voiceChannels(): Channel[] {
    return this.channels.filter((channel) => channel.type === 'voice');
  }

  /**
   * Récupère la liste des membres d'un serveur spécifique, avec leur statut de connexion
   * @param serverId ID du serveur dont on veut récupérer les membres
   */
  listUsers(serverId: string): void {
    this.serverService.getServerById(serverId).subscribe({
      next: (res) => {
        this.members = res.data.memberIds;
        this.presence.setMany(res.data.memberIds.map((member) => ({ _id: member._id, online: member.online ?? false })));
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
    this.channelService.getChannelsByServerId(serverId).subscribe({
      next: (res) => {
        this.channels = res.data;
        this.voice.setOccupancy(res.data);
      },
      error: (err) => {
        // Les erreurs d'accès sont déjà traitées par listUsers
        console.error("Erreur lors de la récupération des salons: ", err);
      }
    });
  }

  /**
   * Rejoint un salon vocal, ou le quitte si on y est déjà
   */
  toggleVoice(channel: Channel): void {
    if (this.voice.channelId === channel._id) {
      this.voice.leave();
    } else {
      void this.voice.join(channel);
    }
  }

  /**
   * Envoie une demande d'ami à un membre du serveur
   */
  addFriend(member: Member): void {
    this.friendService.sendRequest({ userId: member._id }).subscribe({
      error: (err) => {
        console.error("Erreur lors de la demande d'ami: ", err);
        alert(apiErrorMessage(err));
      }
    });
  }
}
