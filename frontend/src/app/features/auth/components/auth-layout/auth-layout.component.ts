import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './auth-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class AuthLayoutComponent {

}
