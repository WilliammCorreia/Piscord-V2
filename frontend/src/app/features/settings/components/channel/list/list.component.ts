import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ChannelService } from '../../../../server/services/channel/channel.service';
import { Channel } from '../../../../server/models/channel.model';
import { ActivatedRoute } from '@angular/router';
import { apiErrorMessage } from '../../../../../core/models/api.model';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
        this.channels = response.data;
      },
      error: (err) => {
        this.loading = false;
        this.error = apiErrorMessage(err, 'Erreur lors du chargement des salons');
        console.error('Erreur HTTP:', err);
      }
    });
  }

  /**
   * Recharge la liste des salons
   */
  refreshChannels(): void {
    this.loadChannels();
  }
}
