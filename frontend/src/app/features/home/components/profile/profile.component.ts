import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProfileComponent {
  name: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.name = this.authService.user?.username || '';
  }
}
