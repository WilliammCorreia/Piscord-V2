import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  SigninRequest, 
  SigninResponse, 
  SignupRequest, 
  SignupResponse, 
  ErrorResponse 
} from '../models/auth.model';

/**
 * Service d'authentification
 * Gère les requêtes d'authentification vers l'API backend
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  /**
   * Authentifie un utilisateur avec ses identifiants
   * @param credentials Objet contenant email et mot de passe
   * @returns Observable de la réponse de connexion ou d'erreur
   */
  signin(credentials: SigninRequest): Observable<SigninResponse | ErrorResponse> {
    return this.http.post<SigninResponse | ErrorResponse>(`${this.apiUrl}/signin`, credentials, {
      withCredentials: true
    });
  }

  /**
   * Crée un nouveau compte utilisateur
   * @param credentials Objet contenant email, mot de passe et nom d'utilisateur
   * @returns Observable de la réponse d'inscription ou d'erreur
   */
  signup(credentials: SignupRequest): Observable<SignupResponse | ErrorResponse> {
    return this.http.post<SignupResponse | ErrorResponse>(`${this.apiUrl}/signup`, credentials, {
      withCredentials: true
    });
  }
}
