import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-server',
    templateUrl: './server.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './server.component.scss',
    imports: [RouterLink, RouterLinkActive, RouterOutlet]
})
export class ServerComponent {

}
