import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../testing/providers';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideTestingDeps() });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('demande les messages les plus récents quand aucun curseur n\'est fourni', () => {
    service.getMessagesByChannel('salon1').subscribe();

    const req = httpMock.expectOne('/api/message/reference/salon1');
    expect(req.request.params.has('before')).toBe(false);
    req.flush({ success: true, data: [], hasMore: false, message: '' });
  });

  it('transmet le curseur pour remonter dans l\'historique', () => {
    service.getMessagesByChannel('salon1', 'message42').subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/message/reference/salon1');
    expect(req.request.params.get('before')).toBe('message42');
    req.flush({ success: true, data: [], hasMore: false, message: '' });
  });
});
