import { TestBed } from '@angular/core/testing';
import { FakeSocketService } from '../../../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../../../testing/providers';
import { Channel } from '../../models/channel.model';
import { SocketService } from '../socketio/socket.service';
import { VoiceService } from './voice.service';

/** Connexion WebRTC factice : enregistre ce que le service lui demande */
class FakeRTCPeerConnection {
  static instances: FakeRTCPeerConnection[] = [];

  connectionState: RTCPeerConnectionState = 'new';
  localDescription: { type: string; sdp: string; toJSON: () => unknown } | null = null;
  remoteDescription: RTCSessionDescriptionInit | null = null;
  readonly tracks: unknown[] = [];
  readonly candidates: RTCIceCandidateInit[] = [];
  closed = false;

  constructor() {
    FakeRTCPeerConnection.instances.push(this);
  }

  addTrack(track: unknown): void {
    this.tracks.push(track);
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: 'offre' };
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'answer', sdp: 'réponse' };
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.localDescription = { type: description.type as string, sdp: description.sdp as string, toJSON: () => description };
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.remoteDescription = description;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.remoteDescription) throw new Error('candidat reçu avant la description distante');
    this.candidates.push(candidate);
  }

  close(): void {
    this.closed = true;
  }
}

const VOICE_CHANNEL: Pick<Channel, '_id' | 'name'> = { _id: 'vocal-1', name: 'Vocal' };
const ALICE = { socketId: 'socket-alice', userId: 'alice', username: 'alice' };

/** Laisse se terminer les promesses en attente (le service enchaîne plusieurs `await`) */
const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('VoiceService', () => {
  let service: VoiceService;
  let socket: FakeSocketService;
  let track: { enabled: boolean; stop: ReturnType<typeof vi.fn> };
  let getUserMedia: ReturnType<typeof vi.fn>;

  const signals = () => socket.emittedFor('voice:signal') as { to: string; data: { description?: RTCSessionDescriptionInit; candidate?: unknown } }[];
  const connection = (index = 0) => FakeRTCPeerConnection.instances[index];

  const join = async (peers: typeof ALICE[] = []) => {
    socket.ackResponses.set('voice:join', { ok: true, peers });
    await service.join(VOICE_CHANNEL);
  };

  beforeEach(() => {
    FakeRTCPeerConnection.instances = [];
    track = { enabled: true, stop: vi.fn() };
    getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [track], getAudioTracks: () => [track] });

    vi.stubGlobal('RTCPeerConnection', FakeRTCPeerConnection);
    vi.stubGlobal('Audio', class { autoplay = false; srcObject: unknown = null; play = () => Promise.resolve(); });
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });

    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;
    service = TestBed.inject(VoiceService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'mediaDevices');
  });

  describe('rejoindre un salon', () => {
    it("demande le micro, entre dans le salon et appelle chaque participant déjà présent", async () => {
      await join([ALICE]);

      expect(getUserMedia).toHaveBeenCalledOnce();
      expect(socket.emittedFor('voice:join')).toEqual(['vocal-1']);
      expect(service.channelId).toBe('vocal-1');
      expect(connection().tracks).toEqual([track]);
      expect(signals()).toEqual([{ to: 'socket-alice', data: { description: { type: 'offer', sdp: 'offre' } } }]);
    });

    it("n'appelle personne dans un salon vide", async () => {
      await join();

      expect(service.channelId).toBe('vocal-1');
      expect(FakeRTCPeerConnection.instances).toEqual([]);
      expect(signals()).toEqual([]);
    });

    it("rend le micro et explique le refus quand le salon est complet", async () => {
      socket.ackResponses.set('voice:join', { ok: false, code: 'VOICE_CHANNEL_FULL' });

      await service.join(VOICE_CHANNEL);

      expect(service.channelId).toBeNull();
      expect(service.error).toBe('Ce salon vocal est complet.');
      expect(track.stop).toHaveBeenCalled();
    });

    it("explique quand l'accès au micro est refusé", async () => {
      getUserMedia.mockRejectedValue(Object.assign(new Error('refusé'), { name: 'NotAllowedError' }));
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await service.join(VOICE_CHANNEL);

      expect(service.channelId).toBeNull();
      expect(service.error).toBe("L'accès au micro a été refusé.");
      expect(socket.emittedFor('voice:join')).toEqual([]);
    });

    it('signale que le vocal a besoin de HTTPS quand le navigateur ne donne pas accès au micro', async () => {
      Reflect.deleteProperty(navigator, 'mediaDevices');

      await service.join(VOICE_CHANNEL);

      expect(service.error).toContain('HTTPS');
      expect(service.channelId).toBeNull();
    });
  });

  describe('signalisation', () => {
    beforeEach(() => join());

    it("répond à l'offre d'un participant qui arrive après nous", async () => {
      socket.trigger('voice:peer-joined', ALICE);
      socket.trigger('voice:signal', { from: 'socket-alice', data: { description: { type: 'offer', sdp: 'offre-alice' } } });
      await flush();

      expect(connection().remoteDescription).toEqual({ type: 'offer', sdp: 'offre-alice' });
      expect(signals()).toEqual([{ to: 'socket-alice', data: { description: { type: 'answer', sdp: 'réponse' } } }]);
    });

    it("garde les candidats ICE arrivés trop tôt et les applique dès que l'offre est là", async () => {
      socket.trigger('voice:peer-joined', ALICE);
      socket.trigger('voice:signal', { from: 'socket-alice', data: { candidate: { candidate: 'c1' } } });
      await flush();
      expect(connection().candidates).toEqual([]);

      socket.trigger('voice:signal', { from: 'socket-alice', data: { description: { type: 'offer', sdp: 'offre-alice' } } });
      await flush();
      socket.trigger('voice:signal', { from: 'socket-alice', data: { candidate: { candidate: 'c2' } } });
      await flush();

      expect(connection().candidates).toEqual([{ candidate: 'c1' }, { candidate: 'c2' }]);
    });

    it("ignore la signalisation d'un socket inconnu", async () => {
      socket.trigger('voice:signal', { from: 'socket-inconnu', data: { description: { type: 'offer', sdp: 'x' } } });
      await flush();

      expect(FakeRTCPeerConnection.instances).toEqual([]);
      expect(signals()).toEqual([]);
    });

    it("ferme la connexion d'un participant qui s'en va", () => {
      socket.trigger('voice:peer-joined', ALICE);

      socket.trigger('voice:peer-left', { socketId: 'socket-alice' });

      expect(connection().closed).toBe(true);
      expect(service.peerStates).toEqual([]);
    });
  });

  describe('micro et sortie', () => {
    beforeEach(() => join([ALICE]));

    it('coupe et réactive le micro sans quitter le salon', () => {
      service.toggleMute();
      expect(track.enabled).toBe(false);
      expect(service.muted).toBe(true);

      service.toggleMute();
      expect(track.enabled).toBe(true);
      expect(service.channelId).toBe('vocal-1');
    });

    it('en raccrochant : prévient le serveur, ferme les connexions et rend le micro', () => {
      service.leave();

      expect(socket.emittedFor('voice:leave')).toHaveLength(1);
      expect(connection().closed).toBe(true);
      expect(track.stop).toHaveBeenCalled();
      expect(service.channelId).toBeNull();
    });

    it('raccroche aussi quand la connexion temps réel est perdue', () => {
      socket.trigger('disconnect');

      expect(connection().closed).toBe(true);
      expect(track.stop).toHaveBeenCalled();
      expect(service.channelId).toBeNull();
    });
  });

  describe('occupation des salons', () => {
    it("reprend les participants fournis avec la liste des salons, puis suit les changements", () => {
      service.setOccupancy([
        { _id: 'vocal-1', name: 'Vocal', type: 'voice', participants: [{ userId: 'alice', username: 'alice' }] },
        { _id: 'texte-1', name: 'Général', type: 'text' },
      ] as Channel[]);

      expect(service.participants('vocal-1')).toEqual([{ userId: 'alice', username: 'alice' }]);
      expect(service.participants('texte-1')).toEqual([]);

      socket.trigger('voice:state', { channelId: 'vocal-1', participants: [] });

      expect(service.participants('vocal-1')).toEqual([]);
    });
  });
});
