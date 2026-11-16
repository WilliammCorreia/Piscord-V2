import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ShellComponent } from '../../../../core/components/shell/shell.component';
import { FriendService } from '../../../friends/services/friend.service';
import { VoiceService } from '../../../server/services/voice/voice.service';

@Component({
    selector: 'app-home-layout',
    templateUrl: './home-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, RouterOutlet, ShellComponent]
})
export class HomeLayoutComponent {

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private voiceService: VoiceService,
    private router: Router,
    protected friendService: FriendService
  ) { }

  onDisconnect(): void {
    // On raccroche avant de fermer la session : le micro ne doit pas rester ouvert
    this.voiceService.leave();

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
