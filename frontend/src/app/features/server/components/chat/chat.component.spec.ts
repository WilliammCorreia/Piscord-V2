import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FakeSocketService } from '../../../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../../../testing/providers';
import { AuthService } from '../../../auth/services/auth.service';
import { Message } from '../../models/message.model';
import { SocketService } from '../../services/socketio/socket.service';
import { ChatComponent } from './chat.component';

const ME = { id: 'user-me', email: 'moi@test.com', username: 'moi' };

function buildMessage(overrides: Partial<Message> = {}): Message {
  return {
    _id: 'message-1',
    content: 'bonjour',
    authorId: { _id: 'user-autre', username: 'autre' },
    referenceId: 'salon-a',
    isDeleted: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    __v: 0,
    ...overrides
  };
}

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let httpMock: HttpTestingController;
  let socket: FakeSocketService;
  let params: BehaviorSubject<ParamMap>;

  const messagesUrl = (channelId: string) => `/api/message/reference/${channelId}`;

  /** Contenus des messages affichés dans le DOM */
  const displayed = (): string[] => {
    fixture.detectChanges();
    const paragraphs = (fixture.nativeElement as HTMLElement).querySelectorAll('.message p');
    return Array.from(paragraphs).map((p) => p.textContent ?? '');
  };

  /** Répond à la requête de chargement initial d'un salon */
  const flushHistory = (channelId: string, messages: Message[] = [], hasMore = false) => {
    httpMock.expectOne(messagesUrl(channelId)).flush({ success: true, data: messages, hasMore, message: '' });
  };

  const type = (text: string) => {
    fixture.componentInstance.textMessage = text;
    fixture.componentInstance.sendMessage();
  };

  beforeEach(async () => {
    localStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ channelId: 'salon-a' }));

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        ...provideTestingDeps(),
        { provide: ActivatedRoute, useValue: { paramMap: params.asObservable() } }
      ]
    }).compileComponents();

    TestBed.inject(AuthService).setUser(ME);
    httpMock = TestBed.inject(HttpTestingController);
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;

    fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('rejoint le salon et affiche son historique', () => {
    flushHistory('salon-a', [buildMessage({ content: 'ancien' })]);

    expect(socket.emittedFor('join-channel')).toEqual(['salon-a']);
    expect(displayed()).toEqual(['ancien']);
  });

  describe('messages reçus en temps réel', () => {
    beforeEach(() => flushHistory('salon-a'));

    it('affiche un message du salon courant', () => {
      socket.trigger('message', buildMessage({ content: 'en direct' }));

      expect(displayed()).toEqual(['en direct']);
    });

    it("ignore un message destiné à un autre salon", () => {
      socket.trigger('message', buildMessage({ referenceId: 'salon-b', content: 'pas pour ici' }));

      expect(displayed()).toEqual([]);
    });

    it('ne duplique pas un message reçu deux fois', () => {
      socket.trigger('message', buildMessage());
      socket.trigger('message', buildMessage());

      expect(displayed()).toHaveLength(1);
    });

    it('retire un message supprimé', () => {
      socket.trigger('message', buildMessage());

      socket.trigger('message-deleted', { _id: 'message-1', referenceId: 'salon-a' });

      expect(displayed()).toEqual([]);
    });
  });

  describe("envoi d'un message", () => {
    beforeEach(() => flushHistory('salon-a'));

    it("l'affiche immédiatement et l'enregistre par l'API, sans le diffuser lui-même sur le socket", () => {
      type('  salut  ');

      expect(displayed()).toEqual(['salut']);
      expect(socket.emittedFor('message')).toEqual([]);

      const req = httpMock.expectOne('/api/message/');
      expect(req.request.body).toEqual({ content: 'salut', referenceId: 'salon-a' });
      req.flush({ success: true, data: buildMessage({ _id: 'reel', content: 'salut', authorId: { _id: ME.id, username: ME.username } }), message: '' });
    });

    it("n'envoie pas un message vide", () => {
      type('   ');

      httpMock.expectNone('/api/message/');
      expect(displayed()).toEqual([]);
    });

    it("n'affiche le message qu'une fois, que le socket confirme avant ou après l'API", () => {
      const saved = buildMessage({ _id: 'reel', content: 'salut', authorId: { _id: ME.id, username: ME.username } });

      // Le socket arrive avant la réponse HTTP
      type('salut');
      socket.trigger('message', saved);
      httpMock.expectOne('/api/message/').flush({ success: true, data: saved, message: '' });
      expect(displayed()).toEqual(['salut']);

      // La réponse HTTP arrive avant le socket
      const second = { ...saved, _id: 'reel-2', content: 'encore' };
      type('encore');
      httpMock.expectOne('/api/message/').flush({ success: true, data: second, message: '' });
      socket.trigger('message', second);
      expect(displayed()).toEqual(['salut', 'encore']);
    });

    it("retire le message et rend le texte si l'envoi échoue", () => {
      vi.spyOn(window, 'alert').mockImplementation(() => undefined);

      type('perdu');
      httpMock.expectOne('/api/message/').flush(
        { success: false, code: 'NOT_A_MEMBER', message: "Vous n'êtes pas membre de ce serveur" },
        { status: 403, statusText: 'Forbidden' }
      );

      expect(displayed()).toEqual([]);
      expect(fixture.componentInstance.textMessage).toBe('perdu');
    });
  });

  describe('changement de salon', () => {
    it("quitte l'ancien salon, rejoint le nouveau et repart d'une liste vide", () => {
      flushHistory('salon-a', [buildMessage({ content: 'dans A' })]);

      params.next(convertToParamMap({ channelId: 'salon-b' }));

      expect(socket.emittedFor('leave-channel')).toEqual(['salon-a']);
      expect(socket.emittedFor('join-channel')).toEqual(['salon-a', 'salon-b']);
      expect(displayed()).toEqual([]);
      flushHistory('salon-b');
    });

    it("n'affiche pas l'historique de l'ancien salon s'il arrive après le changement", () => {
      const pendingA = httpMock.expectOne(messagesUrl('salon-a'));

      params.next(convertToParamMap({ channelId: 'salon-b' }));
      flushHistory('salon-b', [buildMessage({ referenceId: 'salon-b', content: 'dans B' })]);
      pendingA.flush({ success: true, data: [buildMessage({ content: 'dans A' })], hasMore: false, message: '' });

      expect(displayed()).toEqual(['dans B']);
    });

    it('retourne dans le salon après une reconnexion du socket', () => {
      flushHistory('salon-a');

      socket.trigger('connect');

      expect(socket.emittedFor('join-channel')).toEqual(['salon-a', 'salon-a']);
    });
  });

  describe('historique', () => {
    it('charge les messages précédents avec le curseur du plus ancien message affiché', () => {
      flushHistory('salon-a', [buildMessage({ _id: 'm50', content: 'récent' })], true);
      fixture.detectChanges();

      fixture.componentInstance.loadOlderMessages();
      const req = httpMock.expectOne((r) => r.url === messagesUrl('salon-a') && r.params.get('before') === 'm50');
      req.flush({ success: true, data: [buildMessage({ _id: 'm49', content: 'plus ancien' })], hasMore: false, message: '' });

      expect(displayed()).toEqual(['plus ancien', 'récent']);
      expect((fixture.nativeElement as HTMLElement).querySelector('.load-older')).toBeNull();
    });
  });

  describe('indicateur de saisie', () => {
    beforeEach(() => flushHistory('salon-a'));

    it("signale la saisie sans envoyer de pseudo : c'est le serveur qui l'ajoute", () => {
      fixture.componentInstance.handleKeyDown(new KeyboardEvent('keydown', { key: 'a' }));

      expect(socket.emittedFor('typing')).toEqual([{ channelId: 'salon-a' }]);
    });

    it("n'affiche que les saisies du salon courant", () => {
      socket.trigger('typing', { username: 'autre', channelId: 'salon-b' });
      expect(fixture.componentInstance.typingText).toBe('');

      socket.trigger('typing', { username: 'autre', channelId: 'salon-a' });
      expect(fixture.componentInstance.typingText).toBe('autre écrit...');
    });
  });
});
