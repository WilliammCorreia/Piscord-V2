import { TestBed } from '@angular/core/testing';
import { FakeSocketService } from '../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../testing/providers';
import { AuthService } from '../../features/auth/services/auth.service';
import { SocketService } from '../../features/server/services/socketio/socket.service';
import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let presence: PresenceService;
  let socket: FakeSocketService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;
    presence = TestBed.inject(PresenceService);
    TestBed.inject(AuthService).setUser({ id: 'moi', email: 'moi@test.com', username: 'moi' });
  });

  it("suit les connexions et déconnexions annoncées par le serveur", () => {
    expect(presence.isOnline('alice')).toBe(false);

    socket.trigger('presence', { userId: 'alice', online: true });
    expect(presence.isOnline('alice')).toBe(true);

    socket.trigger('presence', { userId: 'alice', online: false });
    expect(presence.isOnline('alice')).toBe(false);
  });

  it("reprend l'état initial fourni par l'API", () => {
    presence.setMany([{ _id: 'alice', online: true }, { _id: 'bob', online: false }]);

    expect(presence.isOnline('alice')).toBe(true);
    expect(presence.isOnline('bob')).toBe(false);
  });

  it("pour soi-même, reflète l'état de sa propre connexion temps réel", () => {
    expect(presence.isOnline('moi')).toBe(true); // setUser a ouvert le socket

    socket.connected = false;

    expect(presence.isOnline('moi')).toBe(false);
  });

  it("oublie le statut des autres quand la connexion temps réel est perdue", () => {
    socket.trigger('presence', { userId: 'alice', online: true });

    socket.trigger('disconnect');

    expect(presence.isOnline('alice')).toBe(false);
  });
});
