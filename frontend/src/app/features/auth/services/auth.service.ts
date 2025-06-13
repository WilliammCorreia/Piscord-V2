import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface SigninRequest {
  email: string;
  password: string;
}

interface SigninResponse {
  success: boolean;
  data: {
    email: string;
    username: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  signin(credentials: SigninRequest): Observable<SigninResponse> {
    return this.http.post<SigninResponse>(`${this.apiUrl}/signin`, credentials, {
      withCredentials: true
    });
  };
}
