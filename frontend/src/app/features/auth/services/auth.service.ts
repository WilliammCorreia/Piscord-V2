import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
  UserData
} from '../models/auth.model';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../server/services/socketio/socket.service';

/**
 * Service d'authentification
 * Gère les requêtes d'authentification vers l'API backend
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/auth`;
  private userData: UserData | null = null;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   * @param socketService Connexion temps réel, fermée à la déconnexion
   */
  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    this.userData = this.readStoredUser();
  }

  /**
   * Relit l'utilisateur mémorisé. Ce n'est qu'un affichage : la session, elle,
   * est portée par les cookies httpOnly et vérifiée par l'API à chaque requête.
   */
  private readStoredUser(): UserData | null {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
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
   * @returns Observable de la réponse de connexion
   */
  signin(credentials: SigninRequest): Observable<SigninResponse> {
    return this.http.post<SigninResponse>(`${this.apiUrl}/signin`, credentials);
  }

  /**
   * Crée un nouveau compte utilisateur
   * @param credentials Objet contenant email, mot de passe et nom d'utilisateur
   * @returns Observable de la réponse d'inscription
   */
  signup(credentials: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, credentials);
  }

  /**
   * Récupère les données de l'utilisateur actuellement connecté
   * @returns Données de l'utilisateur ou null si non connecté
   */
  get user(): UserData | null {
    return this.userData;
  }

  /**
   * Nettoie les données locales et ferme la connexion temps réel.
   * Le socket est lié à la session : il ne doit pas survivre à un changement d'utilisateur.
   */
  logout(): void {
    this.userData = null;
    localStorage.removeItem("user");
    this.socketService.disconnect();
  }
}
