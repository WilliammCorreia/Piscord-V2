import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/auth`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  /**
   * Déconnecte l'utilisateur côté serveur (révocation de la session, suppression des cookies)
   */
  disconnect(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/disconnect`, null);
  }
}
