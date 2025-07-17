import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  name: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.name = this.authService.user?.username || '';
  }
}
