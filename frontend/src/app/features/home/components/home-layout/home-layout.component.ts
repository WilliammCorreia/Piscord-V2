import { Component } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-home-layout',
  standalone: false,
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.scss'
})
export class HomeLayoutComponent {

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router
  ) { }

  onDisconnect(): void {
    this.homeService.disconnect().subscribe({
      next: (res) => {
        this.authService.logout();
        this.router.navigate(["/auth"]);
      },
      error: (err) => {
        console.error("Erreur lors de la déconnexion:", err);
        alert("Une erreur est survenue, veuillez ressayer plus tard.");
      }
    });
  }
}
