import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  SigninRequest, 
  SigninResponse, 
  SignupRequest, 
  SignupResponse, 
  ErrorResponse, 
  UserData
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
  private userData: UserData | null = null;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { 
    const saved = localStorage.getItem("user");
    if (saved) {
      this.userData = JSON.parse(saved);
    }
  }

  /**
   * Sauvegarde les données utilisateur dans le localStorage
   * @param user Données de l'utilisateur à sauvegarder
   */
  setUser(user: UserData): void {
    this.userData = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

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

  /**
   * Récupère les données de l'utilisateur actuellement connecté
   * @returns Données de l'utilisateur ou null si non connecté
   */
  get user(): UserData | null {
    return this.userData;
  }

  /**
   * Déconnecte l'utilisateur et nettoie les données locales
   */
  logout(): void {
    this.userData = null;
    localStorage.removeItem("user");
  }
}
