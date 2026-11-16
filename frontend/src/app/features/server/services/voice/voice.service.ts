import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Channel, VoiceParticipant } from '../../models/channel.model';
import { SocketService } from '../socketio/socket.service';

/** Participant d'un salon vocal, identifié par son socket */
interface VoicePeer {
  socketId: string;
  userId: string;
  username: string;
}

type VoiceJoinResponse = { ok: true; peers: VoicePeer[] } | { ok: false; code: string };

/** Message de signalisation WebRTC échangé entre deux participants, via le serveur */
interface SignalData {
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface PeerEntry {
  info: VoicePeer;
  connection: RTCPeerConnection;
  audio: HTMLAudioElement;
  /** Candidats ICE reçus avant la description distante : appliqués dès qu'elle arrive */
  pendingCandidates: RTCIceCandidateInit[];
}

const JOIN_ERRORS: Record<string, string> = {
  VOICE_CHANNEL_FULL: 'Ce salon vocal est complet.',
  NOT_A_MEMBER: "Vous n'êtes pas membre de ce serveur.",
  NOT_A_VOICE_CHANNEL: "Ce salon n'est pas un salon vocal.",
};

/**
 * Salons vocaux.
 * Le son circule directement entre les navigateurs (WebRTC, une connexion par participant).
 * Le serveur ne fait que relayer la signalisation : celui qui arrive appelle chaque
 * participant déjà présent, qui lui répond.
 */
@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  /** Salon vocal dans lequel on se trouve, ou null */
  channelId: string | null = null;
  channelName: string = '';
  muted: boolean = false;
  joining: boolean = false;
  error: string = '';

  private localStream: MediaStream | null = null;
  private readonly peers = new Map<string, PeerEntry>();

  /** Salon vocal -> participants, pour tous les salons des serveurs de l'utilisateur */
  private readonly occupancy = new Map<string, VoiceParticipant[]>();

  constructor(private socketService: SocketService) {
    this.socketService.listen<VoicePeer>('voice:peer-joined').subscribe((peer) => {
      // Le nouvel arrivant va nous appeler : on prépare la connexion qui recevra son offre
      if (this.channelId) this.addPeer(peer);
    });

    this.socketService.listen<{ socketId: string }>('voice:peer-left').subscribe(({ socketId }) => this.removePeer(socketId));

    this.socketService.listen<{ from: string; data: SignalData }>('voice:signal').subscribe(({ from, data }) => {
      void this.onSignal(from, data);
    });

    this.socketService.listen<{ channelId: string; participants: VoiceParticipant[] }>('voice:state').subscribe((state) => {
      this.occupancy.set(state.channelId, state.participants);
    });

    // Sans socket, le serveur nous a retirés du salon
    this.socketService.listen<void>('disconnect').subscribe(() => this.teardown());
  }

  /** Enregistre l'occupation des salons vocaux reçue avec la liste des salons */
  setOccupancy(channels: Channel[]): void {
    for (const channel of channels) {
      if (channel.type === 'voice') {
        this.occupancy.set(channel._id, channel.participants ?? []);
      }
    }
  }

  participants(channelId: string): VoiceParticipant[] {
    return this.occupancy.get(channelId) ?? [];
  }

  /** État de la connexion audio avec chaque autre participant */
  get peerStates(): { username: string; state: RTCPeerConnectionState }[] {
    return Array.from(this.peers.values()).map((peer) => ({
      username: peer.info.username,
      state: peer.connection.connectionState
    }));
  }

  /**
   * Rejoint un salon vocal (en quittant le précédent s'il y en avait un)
   */
  async join(channel: Pick<Channel, '_id' | 'name'>): Promise<void> {
    if (this.joining) return;

    this.error = '';

    // Les navigateurs ne donnent accès au micro que sur une page sécurisée
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error = 'Le vocal nécessite une connexion sécurisée (HTTPS).';
      return;
    }

    this.joining = true;

    try {
      this.leave();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      });

      const response = await this.socketService.emitWithAck<VoiceJoinResponse>('voice:join', channel._id);
      if (!response.ok) {
        stream.getTracks().forEach((track) => track.stop());
        this.error = JOIN_ERRORS[response.code] ?? 'Impossible de rejoindre le salon vocal.';
        return;
      }

      this.localStream = stream;
      this.channelId = channel._id;
      this.channelName = channel.name;
      this.muted = false;

      for (const peer of response.peers) {
        await this.call(this.addPeer(peer));
      }
    } catch (err) {
      console.error('Erreur lors de la connexion au salon vocal: ', err);
      this.error = (err as DOMException)?.name === 'NotAllowedError'
        ? "L'accès au micro a été refusé."
        : "Impossible d'accéder au micro.";
      this.teardown();
    } finally {
      this.joining = false;
    }
  }

  /**
   * Quitte le salon vocal
   */
  leave(): void {
    if (!this.channelId) return;

    this.socketService.emit('voice:leave');
    this.teardown();
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.localStream?.getAudioTracks().forEach((track) => { track.enabled = !this.muted; });
  }

  /** Ferme toutes les connexions et rend le micro */
  private teardown(): void {
    this.peers.forEach((_peer, socketId) => this.removePeer(socketId));
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.channelId = null;
    this.channelName = '';
    this.muted = false;
  }

  /**
   * Prépare la connexion audio avec un participant
   */
  private addPeer(info: VoicePeer): PeerEntry {
    this.removePeer(info.socketId);

    const connection = new RTCPeerConnection({ iceServers: environment.ICE_SERVERS });
    const audio = new Audio();
    audio.autoplay = true;

    const stream = this.localStream;
    stream?.getTracks().forEach((track) => connection.addTrack(track, stream));

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signal(info.socketId, { candidate: event.candidate.toJSON() });
      }
    };

    connection.ontrack = (event) => {
      audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      void audio.play().catch(() => undefined);
    };

    const entry: PeerEntry = { info, connection, audio, pendingCandidates: [] };
    this.peers.set(info.socketId, entry);

    return entry;
  }

  private removePeer(socketId: string): void {
    const peer = this.peers.get(socketId);
    if (!peer) return;

    peer.connection.close();
    peer.audio.srcObject = null;
    this.peers.delete(socketId);
  }

  /** Appelle un participant déjà présent dans le salon */
  private async call(peer: PeerEntry): Promise<void> {
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    this.signal(peer.info.socketId, { description: peer.connection.localDescription?.toJSON() });
  }

  /**
   * Traite la signalisation reçue d'un participant : offre, réponse ou candidat ICE
   */
  private async onSignal(from: string, data: SignalData): Promise<void> {
    const peer = this.peers.get(from);
    if (!peer || !data) return;

    try {
      if (data.description) {
        await peer.connection.setRemoteDescription(data.description);

        for (const candidate of peer.pendingCandidates.splice(0)) {
          await peer.connection.addIceCandidate(candidate);
        }

        if (data.description.type === 'offer') {
          const answer = await peer.connection.createAnswer();
          await peer.connection.setLocalDescription(answer);
          this.signal(from, { description: peer.connection.localDescription?.toJSON() });
        }
      } else if (data.candidate) {
        if (peer.connection.remoteDescription) {
          await peer.connection.addIceCandidate(data.candidate);
        } else {
          peer.pendingCandidates.push(data.candidate);
        }
      }
    } catch (err) {
      console.error('Erreur de signalisation vocale: ', err);
    }
  }

  private signal(to: string, data: SignalData): void {
    this.socketService.emit('voice:signal', { to, data });
  }
}
