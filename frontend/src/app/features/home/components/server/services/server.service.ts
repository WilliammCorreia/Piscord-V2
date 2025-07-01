import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateServerRequest, CreateServerResponse, ErrorResponse, UserServersResponse } from '../models/server.model';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly url: string = "http://localhost:3000/api/server";

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
}
