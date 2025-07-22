import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateServerRequest, CreateServerResponse, ErrorResponse, JoinServerRequest, JoinServerResponse, UserServersResponse } from '../models/server.model';
import { environment } from '../../../../../../environments/environments.prod';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrlServer = `${environment.apiUrl}/server`;
  private readonly apiUrlInvitation = `${environment.apiUrl}/invitation`;

  constructor(private http: HttpClient) { }

  getServerByUser(): Observable<UserServersResponse | ErrorResponse> {
    return this.http.get<UserServersResponse | ErrorResponse>(`${this.apiUrlServer}/user`, {
      withCredentials: true,
    });
  }

  createServer(name: CreateServerRequest): Observable<CreateServerResponse | ErrorResponse> {
    return this.http.post<CreateServerResponse | ErrorResponse>(`${this.apiUrlServer}/`, name, {
      withCredentials: true
    });
  }

  joinServer(joinData: JoinServerRequest): Observable<JoinServerResponse | ErrorResponse> {
    return this.http.post<JoinServerResponse | ErrorResponse>(`${this.apiUrlInvitation}/join`, joinData, {
      withCredentials: true
    });
  }
}
