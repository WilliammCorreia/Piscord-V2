import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FakeSocketService } from '../../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../../testing/providers';
import { PresenceService } from '../../../core/services/presence.service';
import { AuthService } from '../../auth/services/auth.service';
import { SocketService } from '../../server/services/socketio/socket.service';
import { FriendList } from '../models/friend.model';
import { FriendService } from './friend.service';

const ME = { id: 'moi', email: 'moi@test.com', username: 'moi' };
const CONVERSATION = 'alice_moi';

const LIST: FriendList = {
  friends: [{ _id: 'f1', user: { _id: 'alice', username: 'alice', online: true }, conversationId: CONVERSATION }],
  incoming: [{ _id: 'f2', user: { _id: 'bob', username: 'bob' }, createdAt: '2026-01-01T00:00:00.000Z' }],
  outgoing: [{ _id: 'f3', user: { _id: 'carol', username: 'carol' }, createdAt: '2026-01-01T00:00:00.000Z' }],
};

describe('FriendService', () => {
  let service: FriendService;
  let httpMock: HttpTestingController;
  let socket: FakeSocketService;
  let auth: AuthService;

  const flushList = (list: FriendList = LIST) =>
    httpMock.expectOne('/api/friend').flush({ success: true, data: list, message: '' });

  const receive = (referenceId: string, authorId: string) =>
    socket.trigger('message', { _id: `m${Math.random()}`, content: 'x', referenceId, authorId: { _id: authorId, username: authorId } });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    httpMock = TestBed.inject(HttpTestingController);
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;
    auth = TestBed.inject(AuthService);
    auth.setUser(ME);
    service = TestBed.inject(FriendService);
  });

  afterEach(() => httpMock.verify());

  it("charge les amis et les demandes, et reprend le statut de connexion des amis", () => {
    service.load();
    flushList();

    expect(service.friends.map((f) => f.user.username)).toEqual(['alice']);
    expect(service.incoming.map((r) => r.user.username)).toEqual(['bob']);
    expect(service.outgoing.map((r) => r.user.username)).toEqual(['carol']);
    expect(TestBed.inject(PresenceService).isOnline('alice')).toBe(true);
  });

  it('recharge la liste à la connexion du socket et quand le serveur signale un changement', () => {
    socket.trigger('connect');
    flushList({ friends: [], incoming: [], outgoing: [] });

    socket.trigger('friends-changed');
    flushList();

    expect(service.friends).toHaveLength(1);
  });

  it("décrit le lien avec chaque utilisateur", () => {
    service.load();
    flushList();

    expect(service.relationWith('moi')).toBe('self');
    expect(service.relationWith('alice')).toBe('friend');
    expect(service.relationWith('bob')).toBe('incoming');
    expect(service.relationWith('carol')).toBe('outgoing');
    expect(service.relationWith('dave')).toBe('none');
  });

  describe('messages privés non lus', () => {
    beforeEach(() => {
      service.load();
      flushList();
    });

    it("compte les messages d'un ami reçus hors de la conversation", () => {
      receive(CONVERSATION, 'alice');
      receive(CONVERSATION, 'alice');

      expect(service.unreadCount(CONVERSATION)).toBe(2);
      // 2 messages non lus + 1 demande reçue
      expect(service.pendingCount).toBe(3);
    });

    it("ne compte ni ses propres messages, ni ceux des salons", () => {
      receive(CONVERSATION, 'moi');
      receive('salon-quelconque', 'alice');

      expect(service.unreadCount(CONVERSATION)).toBe(0);
      expect(service.pendingCount).toBe(1);
    });

    it("ne compte pas les messages de la conversation affichée, et la marque comme lue à l'ouverture", () => {
      receive(CONVERSATION, 'alice');

      service.setActiveConversation(CONVERSATION);
      expect(service.unreadCount(CONVERSATION)).toBe(0);

      receive(CONVERSATION, 'alice');
      expect(service.unreadCount(CONVERSATION)).toBe(0);

      service.setActiveConversation(null);
      receive(CONVERSATION, 'alice');
      expect(service.unreadCount(CONVERSATION)).toBe(1);
    });
  });

  it("ne garde rien de l'utilisateur précédent après sa déconnexion", () => {
    service.load();
    flushList();

    auth.logout();

    expect(service.friends).toEqual([]);
    expect(service.incoming).toEqual([]);
    expect(service.pendingCount).toBe(0);
  });

  it("envoie une demande d'ami puis recharge la liste", () => {
    service.sendRequest({ username: 'dave' }).subscribe();

    const req = httpMock.expectOne('/api/friend/request');
    expect(req.request.body).toEqual({ username: 'dave' });
    req.flush({ success: true, data: { _id: 'f4', status: 'pending' }, message: '' });

    flushList();
  });
});
