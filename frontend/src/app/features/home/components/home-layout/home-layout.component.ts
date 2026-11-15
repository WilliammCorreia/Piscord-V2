import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-home-layout',
    templateUrl: './home-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './home-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class HomeLayoutComponent {

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router
  ) { }

  onDisconnect(): void {
    this.homeService.disconnect().subscribe({
      next: () => {
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
