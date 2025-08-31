import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateServerRequest, CreateServerResponse, ErrorResponse, JoinServerRequest, JoinServerResponse, UserServersResponse } from '../models/server.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly url: string = `${environment.BACKEND_ADDRESS}/api/server`;
  private readonly invitationUrl: string = `${environment.BACKEND_ADDRESS}/api/invitation`;

  constructor(private http: HttpClient) { }

  getServerByUser(): Observable<UserServersResponse | ErrorResponse> {
    return this.http.get<UserServersResponse | ErrorResponse>(`${this.url}/user`, {
      withCredentials: true,
    });
  }

  createServer(name: CreateServerRequest): Observable<CreateServerResponse | ErrorResponse> {
    return this.http.post<CreateServerResponse | ErrorResponse>(`${this.url}/`, name, {
      withCredentials: true
    });
  }

  joinServer(joinData: JoinServerRequest): Observable<JoinServerResponse | ErrorResponse> {
    return this.http.post<JoinServerResponse | ErrorResponse>(`${this.invitationUrl}/join`, joinData, {
      withCredentials: true
    });
  }
}
