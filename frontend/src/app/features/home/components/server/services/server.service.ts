import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorResponse, UserServersResponse } from '../models/server.model';

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
}
