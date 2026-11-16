import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoiceService } from '../../../features/server/services/voice/voice.service';

/**
 * Bandeau de l'appel vocal en cours : visible sur toutes les pages tant qu'on est dans un salon vocal,
 * pour pouvoir couper son micro ou raccrocher d'où que l'on soit.
 */
@Component({
    selector: 'app-voice-bar',
    templateUrl: './voice-bar.component.html',
    styleUrl: './voice-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager
})
export class VoiceBarComponent {
  constructor(protected voice: VoiceService) { }

  /** Résumé de l'état des connexions audio avec les autres participants */
  get status(): string {
    const states = this.voice.peerStates;

    if (states.length === 0) return 'Seul dans le salon';
    if (states.every((peer) => peer.state === 'connected')) return 'Connecté';
    if (states.some((peer) => peer.state === 'failed')) return 'Connexion audio impossible';
    return 'Connexion...';
  }
}
