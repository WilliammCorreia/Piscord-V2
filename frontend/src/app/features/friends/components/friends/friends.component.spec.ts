import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../testing/providers';
import { AuthService } from '../../../auth/services/auth.service';
import { FriendList } from '../../models/friend.model';
import { FriendsComponent } from './friends.component';

const LIST: FriendList = {
  friends: [
    { _id: 'f1', user: { _id: 'alice', username: 'alice', online: true }, conversationId: 'alice_moi' },
    { _id: 'f4', user: { _id: 'dave', username: 'dave', online: false }, conversationId: 'dave_moi' },
  ],
  incoming: [{ _id: 'f2', user: { _id: 'bob', username: 'bob' }, createdAt: '' }],
  outgoing: [],
};

describe('FriendsComponent', () => {
  let fixture: ComponentFixture<FriendsComponent>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  const flushList = (list: FriendList = LIST) => {
    httpMock.expectOne('/api/friend').flush({ success: true, data: list, message: '' });
    fixture.detectChanges();
  };

  const button = (label: string) =>
    Array.from(element.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) as HTMLButtonElement;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [FriendsComponent],
      providers: provideTestingDeps()
    }).compileComponents();

    TestBed.inject(AuthService).setUser({ id: 'moi', email: 'moi@test.com', username: 'moi' });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(FriendsComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    flushList();
  });

  afterEach(() => httpMock.verify());

  it('liste les amis avec leur pastille de statut et un lien vers la conversation privée', () => {
    const rows = Array.from(element.querySelectorAll('.list__item')).filter((row) => row.querySelector('a'));

    expect(rows.map((row) => [
      row.querySelector('a')?.textContent?.trim(),
      row.querySelector('.status-dot')?.classList.contains('online'),
      row.querySelector('a')?.getAttribute('href'),
    ])).toEqual([
      ['alice', true, '/home/friends/alice_moi'],
      ['dave', false, '/home/friends/dave_moi'],
    ]);
  });

  it("permet d'accepter une demande reçue", () => {
    button('Accepter').click();

    httpMock.expectOne('/api/friend/f2/accept').flush({ success: true, data: { _id: 'f2', status: 'accepted' }, message: '' });
    flushList({ ...LIST, incoming: [] });

    expect(button('Accepter')).toBeUndefined();
  });

  it("envoie une demande d'ami au pseudo saisi et confirme l'envoi", () => {
    fixture.componentInstance.formGroup.setValue({ username: 'carol' });
    fixture.detectChanges();

    button('Envoyer').click();

    const req = httpMock.expectOne('/api/friend/request');
    expect(req.request.body).toEqual({ username: 'carol' });
    req.flush({ success: true, data: { _id: 'f5', status: 'pending' }, message: '' });
    flushList();

    expect(element.querySelector('.hint')?.textContent).toBe('Demande envoyée à carol.');
  });

  it("explique quand le pseudo n'existe pas", () => {
    fixture.componentInstance.formGroup.setValue({ username: 'personne' });
    fixture.detectChanges();

    button('Envoyer').click();
    httpMock.expectOne('/api/friend/request').flush(
      { success: false, code: 'USER_NOT_FOUND', message: 'Utilisateur introuvable' },
      { status: 404, statusText: 'Not Found' }
    );
    fixture.detectChanges();

    const feedback = element.querySelector('.hint');
    expect(feedback?.textContent).toContain('personne');
    expect(feedback?.classList).toContain('error');
  });
});
