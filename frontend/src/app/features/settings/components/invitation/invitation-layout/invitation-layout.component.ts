import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-invitation-layout',
    templateUrl: './invitation-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invitation-layout.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class InvitationLayoutComponent {

}
