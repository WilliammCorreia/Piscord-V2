import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { FakeSocketService } from '../../../../../testing/fake-socket.service';
import { provideTestingDeps } from '../../../../../testing/providers';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socketio/socket.service';
import { ServerLayoutComponent } from './server-layout.component';

const ME = { id: 'moi', email: 'moi@test.com', username: 'moi' };

describe('ServerLayoutComponent', () => {
  let fixture: ComponentFixture<ServerLayoutComponent>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;
  let socket: FakeSocketService;

  /** Pseudo -> la pastille du membre est-elle verte ? */
  const dots = (): Record<string, boolean> => {
    fixture.detectChanges();
    return Object.fromEntries(Array.from(element.querySelectorAll('.member')).map((member) => [
      member.querySelector('.member__name')?.textContent ?? '',
      member.querySelector('.status-dot')?.classList.contains('online') ?? false
    ]));
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ServerLayoutComponent],
      providers: [
        ...provideTestingDeps(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'serveur-1' }) } } }
      ]
    }).compileComponents();

    TestBed.inject(AuthService).setUser(ME);
    httpMock = TestBed.inject(HttpTestingController);
    socket = TestBed.inject(SocketService) as unknown as FakeSocketService;

    fixture = TestBed.createComponent(ServerLayoutComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;

    httpMock.expectOne('/api/server/serveur-1').flush({
      success: true,
      message: '',
      data: {
        _id: 'serveur-1',
        name: 'Serveur',
        memberIds: [
          { _id: 'moi', username: 'moi', online: true },
          { _id: 'alice', username: 'alice', online: true },
          { _id: 'bob', username: 'bob', online: false },
        ]
      }
    });
    httpMock.expectOne('/api/channel/server/serveur-1').flush({
      success: true,
      message: '',
      data: [
        { _id: 'texte-1', name: 'général', serverId: 'serveur-1', type: 'text' },
        { _id: 'ancien', name: 'historique', serverId: 'serveur-1' },
        { _id: 'vocal-1', name: 'Vocal', serverId: 'serveur-1', type: 'voice', participants: [{ userId: 'alice', username: 'alice' }] },
      ]
    });
  });

  afterEach(() => httpMock.verify());

  it('affiche une pastille verte sur les membres connectés', () => {
    expect(dots()).toEqual({ moi: true, alice: true, bob: false });
  });

  it("met la pastille à jour quand un membre se connecte ou se déconnecte", () => {
    socket.trigger('presence', { userId: 'bob', online: true });
    socket.trigger('presence', { userId: 'alice', online: false });

    expect(dots()).toEqual({ moi: true, alice: false, bob: true });
  });

  it("ajoute à la liste un membre qui vient de rejoindre le serveur", () => {
    socket.trigger('member-joined', { serverId: 'serveur-1', member: { _id: 'carol', username: 'carol', online: true } });
    socket.trigger('member-joined', { serverId: 'autre-serveur', member: { _id: 'dave', username: 'dave', online: true } });

    expect(dots()).toEqual({ moi: true, alice: true, bob: false, carol: true });
  });

  it('sépare les salons textuels des salons vocaux, et montre qui est en vocal', () => {
    fixture.detectChanges();

    const textLinks = Array.from(element.querySelectorAll('.server-nav__channels a.nav-link')).map((a) => a.textContent?.trim());
    const voiceNames = Array.from(element.querySelectorAll('.voice-channel__name')).map((n) => n.textContent);
    const participants = Array.from(element.querySelectorAll('.voice-participants li')).map((li) => li.textContent?.trim());

    // Un salon sans type date d'avant le vocal : il est textuel
    expect(textLinks).toEqual(['# général', '# historique']);
    expect(voiceNames).toEqual(['Vocal']);
    expect(participants).toEqual(['alice']);
  });

  it("propose d'ajouter en ami les membres qui ne le sont pas, sauf soi-même", () => {
    fixture.detectChanges();

    const addable = Array.from(element.querySelectorAll('.member'))
      .filter((member) => member.querySelector('.member__add'))
      .map((member) => member.querySelector('.member__name')?.textContent);

    expect(addable).toEqual(['alice', 'bob']);

    (element.querySelector('.member__add') as HTMLButtonElement).click();
    const req = httpMock.expectOne('/api/friend/request');
    expect(req.request.body).toEqual({ userId: 'alice' });
    req.flush({ success: true, data: { _id: 'f1', status: 'pending' }, message: '' });
    httpMock.expectOne('/api/friend').flush({
      success: true,
      message: '',
      data: { friends: [], incoming: [], outgoing: [{ _id: 'f1', user: { _id: 'alice', username: 'alice' }, createdAt: '' }] }
    });
    fixture.detectChanges();

    const aliceRow = Array.from(element.querySelectorAll('.member')).find((m) => m.querySelector('.member__name')?.textContent === 'alice');
    expect(aliceRow?.querySelector('.member__add')).toBeNull();
    expect(aliceRow?.querySelector('.member__relation')?.textContent).toBe('Demande envoyée');
  });
});
