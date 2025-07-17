import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChannelService } from '../../../services/channel/channel.service';
import { Channel, ChannelsResponse, ErrorResponse } from '../../../models/channel.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  channels: Channel[] = [];
  serverId: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rootRoute = this.route.pathFromRoot.find(route => route.snapshot.params['id']);
    if (rootRoute) {
      this.serverId = rootRoute.snapshot.params['id'];
      this.loadChannels();
    }
  }

  /**
   * Charge la liste des salons du serveur
   */
  loadChannels(): void {
    if (!this.serverId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.channelService.getChannelsByServerId(this.serverId).subscribe({
      next: (response) => {
        this.loading = false;
        if (this.isChannelsResponse(response)) {
          this.channels = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement des salons';
          console.error('Erreur:', response);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des salons';
        console.error('Erreur HTTP:', err);
      }
    });
  }

  /**
   * Vérifie si la réponse est de type ChannelsResponse
   * @param response Réponse à vérifier
   * @returns true si la réponse est un ChannelsResponse, false sinon
   */
  isChannelsResponse(response: ChannelsResponse | ErrorResponse): response is ChannelsResponse {
    return response.success === true;
  }

  /**
   * Recharge la liste des salons
   */
  refreshChannels(): void {
    this.loadChannels();
  }
}
